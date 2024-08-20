import {useSelector} from "react-redux";
import React, {useEffect, useState} from "react";
import {
    Box,
    Card,
    CardContent,
    Container,
    Grid,
    Typography,
    Alert,
    Button,
    Dialog,
    DialogContent,
    DialogActions,
    Checkbox,
    FormControlLabel,
    IconButton
} from "@mui/material";
import {IoMdClose} from "react-icons/io";
import FullScreenLoader from "@/app/UiComponents/Feedback/FullscreenLoader";
import SignatureDialog from "@/app/UiComponents/Models/SignatureDialog";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import dayjs from 'dayjs';
import {Worker, Viewer} from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import jsPDF from "jspdf";
import "jspdf-autotable";
import {useToastContext} from "@/providers/ToastLoadingProvider";

export default function CheckAttendanceAttachments({children}) {
    let {data} = useSelector((state) => state.auth);
    const [dayAttendances, setDayAttendances] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {setLoading: setToastLoading} = useToastContext();
    const [signatureUrl, setSignatureUrl] = useState(null);
    const [pdfBlob, setPdfBlob] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedAttendance, setSelectedAttendance] = useState(null);
    const [confirmChecked, setConfirmChecked] = useState(false);
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const [signatureDialog, setSignatureDialog] = useState(false)

    useEffect(() => {
        const fetchDayAttendances = async () => {
            try {
                const [dayAttendancesRes, shiftsRes] = await Promise.all([
                    fetch(`/api/employee/private/${data.id}/day-attendances`),
                    fetch(`/api/index?id=shift`),
                ]);

                const dayAttendancesData = await dayAttendancesRes.json();
                const shiftsData = await shiftsRes.json();

                if (dayAttendancesRes.ok && shiftsRes.ok) {
                    setDayAttendances(dayAttendancesData.data);
                    setShifts(shiftsData.data);
                    setSignatureUrl(dayAttendancesData.data[0].user.signature);
                } else {
                    setError('Failed to fetch data.');
                }
            } catch (err) {
                setError('Failed to fetch data.');
            } finally {
                setLoading(false);
            }
        };

        fetchDayAttendances();
    }, [data.id]);

    const handleApprove = async () => {
        const formData = new FormData();
        formData.append('attachment', pdfBlob, 'attendance-template.pdf');

        const res = await handleRequestSubmit(
              formData,
              setToastLoading,
              `employee/private/${data.id}/day-attendances/${selectedAttendance.id}/attachment`,
              true,
              "Uploading",
              false,
              "POST"
        );

        if (res.status === 200) {
            const newData = dayAttendances.filter((day) => +day.id !== +selectedAttendance.id);
            setDayAttendances(newData);
            setIsDialogOpen(false);
        }
    };

    const generatePdf = async (dayAttendance) => {
        setIsPdfLoading(true);
        setSelectedAttendance(dayAttendance);
        const doc = new jsPDF('p', 'pt', 'a4');
        doc.setFontSize(16);
        doc.text("EmSAT/PLD Exam Claim Form", 40, 40);
        doc.addImage('/certLogo.png', 'PNG', 40, 60, 150, 40); // Left logo
        doc.addImage('/examLogo.png', 'PNG', 450, 60, 100, 40); // Right logo

        doc.autoTable({
            startY: 110,
            body: [
                ['Full Name', dayAttendance.user.name || "No name found"],
                ['Duty', dayAttendance.attendances[0]?.dutyRewards[0]?.duty.name || "No duty found"],
                ['Test Date', dayjs(dayAttendance.date).format('DD/MM/YYYY')] // Format the date
            ],
            theme: 'grid',
            styles: {cellPadding: 8}, // Add padding around text in the table cells
            margin: {left: 40, top: 10}
        });

        const totalRewards = dayAttendance.attendances.reduce(
              (acc, attendance) => acc + attendance.dutyRewards.reduce((acc, reward) => acc + reward.amount, 0),
              0
        );

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 15,
            head: [['Shift', 'Duration (hours)', 'Reward']],
            body: dayAttendance.attendances.map(attendance => [
                attendance.shift.name,
                attendance.shift.duration,
                attendance.dutyRewards.reduce((acc, reward) => acc + reward.amount, 0)
            ]),
            foot: [[{content: 'Total Rewards', colSpan: 2, styles: {halign: 'right'}}, totalRewards]],
            margin: {top: 5},
            theme: 'grid',
            styles: {cellPadding: 8},  // Add padding around text in the table cells
        });

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 17,
            head: [['Shift', 'Timing (hours)']],
            body: shifts.map(shift => [
                shift.name,
                shift.duration
            ]),
            margin: {top: 5},
            theme: 'grid',
            styles: {cellPadding: 8},  // Add padding around text in the table cells
        });

        doc.setFontSize(10);

        const checkboxImg = new Image();
        checkboxImg.src = '/checkbox.png';
        doc.addImage(checkboxImg, 'PNG', 40, doc.lastAutoTable.finalY + 30, 10, 10); // Adjust size and position
        doc.text("I confirm that the information provided above is accurate.", 55, doc.lastAutoTable.finalY + 40);
        doc.text("Employee Signature:", 40, doc.lastAutoTable.finalY + 70);
        doc.addImage(signatureUrl, 'PNG', 40, doc.lastAutoTable.finalY + 80, 100, 30); // Smaller image size

        finalizePdf(doc);
    };

    const finalizePdf = (doc) => {
        doc.text("Site Supervisor Name:", 300, doc.lastAutoTable.finalY + 70);

        doc.setLineWidth(2);
        doc.line(40, doc.lastAutoTable.finalY + 115, 550, doc.lastAutoTable.finalY + 115);

        doc.text("For CERT use only", 40, doc.lastAutoTable.finalY + 135);
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 145,
            head: [['Centre Manager', 'Signature', 'Date']],
            body: [
                ['Director', '', ''],
                ['Signature', '', '']
            ],
            margin: {top: 2},
            theme: 'grid',
            styles: {cellPadding: 8},  // Add padding around text in the table cells
        });

        const pdfBlob = doc.output('blob');
        setPdfBlob(pdfBlob);
        setIsPdfLoading(false);
        setIsDialogOpen(true);
    };

    if (error) return <Alert severity="error">{error}</Alert>;
    if (!loading && (!dayAttendances || dayAttendances.length === 0)) {
        return children;
    }

    return (
          <Container>
              {(loading || isPdfLoading) && <FullScreenLoader/>}
              {!loading && dayAttendances?.length > 0 && (
                    <>
                        <Typography variant="h4" gutterBottom>
                            Attendances that need your approval
                        </Typography>
                        <Alert severity="warning" sx={{mb: 2}}>
                            Please review the attendance records and approve them.
                        </Alert>
                    </>
              )}
              <Grid container spacing={3}>
                  {dayAttendances?.map((dayAttendance) => (
                        <Grid item xs={12} md={6} lg={4} key={dayAttendance.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">
                                        Date: {dayjs(dayAttendance.date).format('DD/MM/YYYY')}
                                    </Typography>
                                    <Box mt={2}>
                                        {signatureUrl ? (
                                              <>
                                                  <Button
                                                        variant="contained"
                                                        color="primary"
                                                        sx={{mt: 2}}
                                                        onClick={() => generatePdf(dayAttendance)}
                                                  >
                                                      View and Approve
                                                  </Button>
                                              </>
                                        ) : (
                                              <>
                                                  <Typography variant="body2" color="error">
                                                      You do not have a signature yet. Please create one to proceed.
                                                  </Typography>
                                                  <Button variant="contained" color="primary"
                                                          onClick={() => setSignatureDialog(true)}>
                                                      Add Your Signature
                                                  </Button>
                                                  <SignatureDialog
                                                        user={data}
                                                        open={signatureDialog}
                                                        onClose={() => setSignatureDialog(false)}
                                                        onSignatureSaved={(url) => {
                                                            setSignatureUrl(url);
                                                            setSignatureDialog(false);
                                                        }}
                                                  />
                                              </>
                                        )}
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                  ))}
              </Grid>

              <Dialog fullScreen open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                  <DialogContent style={{padding: 0}}>
                      {pdfBlob && (

                            <Box
                                  sx={{
                                      width: '100%',
                                      height: '100%',
                                      overflow: 'auto',
                                      border: '1px solid #ddd',
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      backgroundColor: '#f0f0f0',
                                      position: 'relative',
                                  }}
                            >

                                <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
                                    <Viewer fileUrl={URL.createObjectURL(pdfBlob)}/>
                                </Worker>
                                <IconButton
                                      color="inherit"
                                      onClick={() => setIsDialogOpen(false)}
                                      sx={{
                                          position: 'fixed',
                                          top: '1rem',
                                          right: '1rem',
                                          backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                          color: 'white',
                                      }}
                                >
                                    <IoMdClose/>
                                </IconButton>
                            </Box>
                      )}
                  </DialogContent>
                  <DialogActions>
                      <ApprovalSection
                            confirmChecked={confirmChecked}
                            setConfirmChecked={setConfirmChecked}
                            handleApprove={handleApprove}
                      />
                  </DialogActions>
              </Dialog>
          </Container>
    );
}

const ApprovalSection = ({confirmChecked, setConfirmChecked, handleApprove}) => (
      <>
          <FormControlLabel
                control={<Checkbox checked={confirmChecked}
                                   onChange={(e) => setConfirmChecked(e.target.checked)}/>}
                label="I confirm that the information provided above is accurate."
          />
          <Button
                variant="contained"
                color="success"
                onClick={handleApprove}
                disabled={!confirmChecked}
          >
              Approve and Submit
          </Button>
      </>
);
