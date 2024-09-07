import {Box, Button, Checkbox, Dialog, DialogActions, DialogContent, FormControlLabel, IconButton} from "@mui/material";
import React, {useCallback, useState} from "react";
import {Viewer, Worker} from "@react-pdf-viewer/core";
import {IoMdClose} from "react-icons/io";
import dayjs from "dayjs";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";
import FullScreenLoader from "@/app/UiComponents/Feedback/FullscreenLoader";
import '@react-pdf-viewer/core/lib/styles/index.css';
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function AttendanceTempSignature({
                                                    attendanceUser,
                                                    attendance,
                                                    signatureUrl,
                                                    setError,
                                                    attendanceShifts,
                                                    setDayAttendances,
                                                    dayAttendances,
                                                    setIsPdfLoading,
                                                    finincal
                                                }) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const {setLoading: setToastLoading} = useToastContext();
    const [pdfBlob, setPdfBlob] = useState(null);
    const [selectedAttendance, setSelectedAttendance] = useState(null);
    const [user, setUser] = useState(attendanceUser)
    const [loading, setLoading] = useState(false)
    const [shifts, setShifts] = useState(attendanceShifts)
    const [shiftsLoading, setLoadingShifts] = useState(false)
    const [dayAttendance, setAttendance] = useState(attendance)
    const [signature, setSignature] = useState(signatureUrl)

    const handleApprove = useCallback(async () => {
        const formData = new FormData();
        formData.append('attachment', pdfBlob, 'attendance-template.pdf');

        const res = await handleRequestSubmit(
              formData,
              setToastLoading,
              finincal ? `finincal/reports/attendances/${selectedAttendance.id}` : `employee/private/${user.id}/day-attendances/${selectedAttendance.id}/attachment`,
              true,
              "Uploading",
              false,
              "POST"
        );

        if (res.status === 200) {

            if (setDayAttendances && finincal) {
                const newData = dayAttendances.map((day) => {
                    if (day.id === dayAttendance.id) {
                        day.attachment = res.data.attachment
                    }
                    return day;
                });
                setDayAttendances(newData);
            } else if (setDayAttendances) {
                const newData = dayAttendances.filter((day) => +day.id !== +selectedAttendance.id);
                setDayAttendances(newData);

            }
            setIsDialogOpen(false);
        }
    }, [pdfBlob, selectedAttendance, dayAttendances, user.id, setToastLoading]);

    async function handleBeforeGenerate() {

        async function getAttendanceById() {
            setLoading(true)
            const request = await fetch("/api/finincal/reports/attendances/" + attendance.id)
            const response = await request.json();
            setAttendance(response.data)
            setUser(response.data.user)
            setSignature(response.data.user.signature)
            setLoading(false)
            return response.data
        }

        async function getShifts() {
            setLoadingShifts(true)
            const request = await fetch(`/api/index?id=shift`)
            const response = await request.json()
            setShifts(response.data)
            setLoadingShifts(false)
            return response.data
        }

        async function queue() {
            const shifts = await getShifts()
            const attendance = await getAttendanceById()
            await generatePdf(attendance, shifts)

        }

        if (finincal) {
            queue()
        } else {
            setLoadingShifts(false)
            setLoading(false)
            await generatePdf(dayAttendance, shifts)
        }
    }

    const generatePdf = async (dayAttendance, shifts) => {
        try {
            if (setIsPdfLoading) {
                setIsPdfLoading(true);
            }
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
            doc.addImage(dayAttendance.user.signature, 'PNG', 40, doc.lastAutoTable.finalY + 80, 100, 30); // Smaller image size

            finalizePdf(doc, dayAttendance);
        } catch (err) {
            console.log(err, "err")
            if (setError) {
                setError(`Error generating PDF: ${err.message}. Please try again.`);
            }
        } finally {
            if (setIsPdfLoading) {
                setIsPdfLoading(false);
            }
        }
    };

    const finalizePdf = (doc, dayAttendance) => {
        doc.text("Site Supervisor Name:", 300, doc.lastAutoTable.finalY + 70);
        const siteSupervisorName = dayAttendance.center?.siteSupervisor || '';
        doc.text(siteSupervisorName, 300, doc.lastAutoTable.finalY + 85);
        doc.setLineWidth(2);
        doc.line(40, doc.lastAutoTable.finalY + 115, 550, doc.lastAutoTable.finalY + 115);
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
        if (setIsPdfLoading) {

            setIsPdfLoading(false);
        }
        setIsDialogOpen(true);
    };

    return (
          <>
              <Button
                    variant="contained"
                    color="primary"
                    sx={{mt: 2}}
                    onClick={() => handleBeforeGenerate()}
              >
                  View and Approve
              </Button>
              {(loading || shiftsLoading) && <FullScreenLoader/>}
              <Dialog fullScreen open={isDialogOpen} onClose={() => setIsDialogOpen(false)}
                      className={"financial-attendance"}
                      sx={{
                          "& .rpv-core__text-layer": {
                              display: "none"
                          }
                      }}
              >
                  <DialogContent style={{padding: 0}}>
                      {pdfBlob && !loading && !shiftsLoading && (
                            <Box
                                  sx={{
                                      width: '100%',
                                      maxWidth: {
                                          md: 600, lg: 800
                                      },
                                      mx: "auto",
                                      height: '100%',
                                      overflow: 'auto',
                                      border: '1px solid #ddd',
                                      display: 'flex',
                                      justifyContent: 'center',
                                      alignItems: 'center',
                                      backgroundColor: '#f0f0f0',
                                      position: 'relative',
                                      py: 10
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
                            handleApprove={handleApprove}
                      />
                  </DialogActions>
              </Dialog>

          </>
    )
}
const ApprovalSection = ({handleApprove}) => {
    const [confirmChecked, setConfirmChecked] = useState(false);
    return (
          <div className={"max:sm:flex flex-col gap-5 items-center justify-center"}>
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
          </div>
    );
}
