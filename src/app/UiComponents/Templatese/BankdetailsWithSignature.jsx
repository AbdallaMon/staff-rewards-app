import React, {useState, useCallback} from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogActions,
    IconButton,
    Alert,
    FormControlLabel,
    Checkbox
} from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import {Worker, Viewer} from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import {IoMdClose} from "react-icons/io";
import SignatureDialog from "@/app/UiComponents/Models/SignatureDialog"; // Assuming the path is correct
import {useToastContext} from "@/providers/ToastLoadingProvider";
import FullScreenLoader from "@/app/UiComponents/Feedback/FullscreenLoader";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit"; // Assuming you have this context provider

const BankDetailsWithSignature = ({user, setUser, onSubmit}) => {
    const [pdfBlob, setPdfBlob] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    const [signatureUrl, setSignatureUrl] = useState(user.signature || null);
    const [signatureDialog, setSignatureDialog] = useState(false);
    const [error, setError] = useState(null);
    const [confirmChecked, setConfirmChecked] = useState(false);
    const {setLoading: setToastLoading} = useToastContext();

    const generatePdf = async () => {
        try {
            if (!signatureUrl) {
                setSignatureDialog(true);
                return;
            }

            setIsPdfLoading(true);
            const doc = new jsPDF('p', 'pt', 'a4');

            // Add title and images
            doc.setFontSize(20);
            doc.text("EmSAT Staff Addition Form", 40, 40);
            doc.addImage('/fullLogo.png', 'PNG', 40, 60, 510, 60);  // Full width image

            // Add personal details table
            doc.autoTable({
                startY: 140,
                body: [
                    ['Name', user.name],
                    ['Contact Number (mobile)', user.phone],
                    ['Email', user.email],
                    ['..........................................................................', ''],
                ],
                styles: {
                    fontSize: 12,
                    cellPadding: 8,
                },
            });

            // Add banking details table
            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 20,
                body: [
                    ['Emirates ID', user.emiratesId],
                    ['Passport Number', user.passportNumber],
                    ['Bank name', user.bankName],
                    ['Name as registered with the bank', user.bankUserName],
                    ['IBAN', user.ibanBank],
                ],
                styles: {
                    fontSize: 12,
                    cellPadding: 8,
                },
            });

            // Add notice and signature sections
            doc.setTextColor(211, 47, 47);
            doc.setFontSize(12);
            doc.setLineHeightFactor(1.7);
            doc.text('', 40, doc.lastAutoTable.finalY + 30);
            doc.text('.', 40, doc.lastAutoTable.finalY + 45);
            doc.setTextColor(0, 0, 0);
            doc.text('SIGNATURE:', 40, doc.lastAutoTable.finalY + 75); // Added margin-top

            doc.addImage(signatureUrl, 'PNG', 160, doc.lastAutoTable.finalY + 55, 100, 30);

            // FOR OFFICE USE ONLY section
            doc.setFontSize(14);
            doc.text('FOR OFFICE USE ONLY', 40, doc.lastAutoTable.finalY + 120);
            doc.setFontSize(12);
            doc.line(40, doc.lastAutoTable.finalY + 125, 550, doc.lastAutoTable.finalY + 125);
            doc.text('System Update Information and Comments:', 40, doc.lastAutoTable.finalY + 150);

            // Add checkbox and fields
            doc.setFontSize(11);
            doc.text('[ ] Updated on System', 40, doc.lastAutoTable.finalY + 180);
            doc.text('Entered by: ...................................', 300, doc.lastAutoTable.finalY + 180);
            doc.text('[ ] Not Updated on System', 40, doc.lastAutoTable.finalY + 210);
            doc.text('Date: .......................................', 300, doc.lastAutoTable.finalY + 210);

            // Comments section
            doc.setFontSize(12);
            doc.text('Comments:', 40, doc.lastAutoTable.finalY + 255);
            doc.setLineWidth(1);
            doc.line(40, doc.lastAutoTable.finalY + 260, 550, doc.lastAutoTable.finalY + 260);
            doc.line(40, doc.lastAutoTable.finalY + 360, 550, doc.lastAutoTable.finalY + 360);

            // Create PDF Blob
            const pdfBlob = doc.output('blob');
            setPdfBlob(pdfBlob);
            setIsDialogOpen(true);
        } catch (err) {
            setError(`Error generating PDF: ${err.message}. Please try again.`);
        } finally {
            setIsPdfLoading(false);
        }
    };

    const handleApprove = useCallback(async () => {
        try {
            setToastLoading(true);
            const formData = new FormData();
            formData.append("bankApprovalAttachment", pdfBlob, 'bank-app-signed.pdf');

            const res = await handleRequestSubmit(
                  formData, setToastLoading, `employee/private/${user.id}`, true, "Uploading...", null, "PUT"
            );
            if (res.status === 200) {
                setIsDialogOpen(false);
                if (setUser) {

                    setUser((user) => ({...user, bankApprovalAttachment: res.user.bankApprovalAttachment}))
                }
                if (onSubmit) {
                    onSubmit()
                }
            }
        } catch (err) {
            setError(`Error during approval: ${err.message}. Please try again.`);
        }
    }, [pdfBlob, setToastLoading]);

    if (isPdfLoading) return <FullScreenLoader/>
    return (
          <>
              {error && <Alert severity="error">{error}</Alert>}
              <Button onClick={generatePdf} variant="contained" color="primary">
                  Preview and approve bank details
              </Button>
              <SignatureDialog
                    user={user}
                    open={signatureDialog}
                    onClose={() => setSignatureDialog(false)}
                    onSignatureSaved={(url) => {
                        setSignatureUrl(url);
                        setSignatureDialog(false);
                        if (setUser) {

                            setUser((old) => ({...old, signature: url}))
                        }
                        generatePdf(); // Regenerate the PDF with the new signature
                    }}
              />

              <Dialog fullScreen open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
                  <DialogContent style={{padding: 0}}>
                      {pdfBlob && (
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
                            confirmChecked={confirmChecked}
                            setConfirmChecked={setConfirmChecked}
                      />
                  </DialogActions>
              </Dialog>
          </>
    );
};

const ApprovalSection = ({handleApprove, confirmChecked, setConfirmChecked}) => (
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

export default BankDetailsWithSignature;
