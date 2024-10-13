import React, {useState} from "react";
import jsPDF from "jspdf";
import dayjs from "dayjs";
import {Alert, Box, Button, CircularProgress, Fade, Grid, Modal, Typography} from "@mui/material";
import {simpleModalStyle} from "@/app/constants";
import FilterSelect from "@/app/UiComponents/FormComponents/FilterSelect";
import arabicFontBase64 from "@/app/UiComponents/Templatese/arabicFont";
import "jspdf-autotable";
import writeXlsxFile from "write-excel-file";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";

export function UserRatingReport({centers, loadingCenters}) {
    const [reportData, setReportData] = useState(null);
    const [loadingReport, setLoadingReport] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [date, setDate] = useState(null);
    const [selectedCenter, setSelectedCenter] = useState("");
    const [selectedExamType, setSelectedExamType] = useState("");
    const [error, setError] = useState(null)
    // Fetch centers for the dropdown (Same as before)
    const handleGenerateReport = async () => {
        setLoadingReport(true);
        const response = await fetch(`/api/admin/attendance/report/user-rating?date=${date}&centerId=${selectedCenter}&examType=${selectedExamType}`);

        const result = await response.json();
        if (result.status !== 200) {
            setError(result.message)
        } else {
            setError(null)
        }
        setReportData(result.data || []);
        setLoadingReport(false);
    };
    const handleGenerateExcel = async () => {
        const schema = [
            {
                column: 'No',
                type: Number,
                value: (item) => item.no + 1,
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 5,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            },
            {
                column: 'User Name',
                type: String,
                value: item => item.user.name,
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 36,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            },
            {
                column: 'Center Name',
                type: String,
                value: item => item.center,
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 32,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            },
            {
                column: 'Duty',
                type: String,
                value: item => item.duty || "N/A",
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 32,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            },
            {
                column: 'Assignment Rating (%)',
                type: String,  // Change to String to append '%'
                value: item => item.userAssignment?.totalRating
                      ? `${(item.userAssignment?.totalRating).toFixed(2)}%`
                      : "0.00%",
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 20,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            },
            {
                column: 'User Total Rating (%)',
                type: String,  // Change to String to append '%'
                value: item => item.user.totalRating
                      ? `${(item.user.totalRating).toFixed(2)}%`
                      : "0.00%",
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 20,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            },
            {
                column: 'Date',
                type: String,
                value: item => dayjs(item.date).format('DD/MM/YYYY'),
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 25,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            }
            , {
                column: 'Exam type',
                type: String,
                value: item => item.examType,
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 25,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            }
        ];
        const data = reportData.map((item, index) => ({
            no: index,
            user: item.user,
            duty: item.duty,
            userAssignment: item.userAssignment,
            date: item.date,
            examType: item.examType
            , center: item.center
        }));

        await writeXlsxFile(data, {
            schema,
            fileName: `User_Rating_Report_${dayjs(date).format('YYYY-MM-DD')}.xlsx`,
            headerStyle: {
                backgroundColor: '#D3E4FF', // Light blue color for header
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                height: 30
            }
        });
    };


    const filterExamTypes = [
        {id: "TEACHER", name: "Teacher"},
        {id: "GRADUATE", name: "Graduate"}
    ];

    return (
          < >

              <div>
                  {/* Calendar rendering stays here */}
                  <Box display="flex" justifyContent="center" my={2}>
                      <Button
                            variant="contained"
                            color="primary"
                            onClick={() => setModalOpen(true)}
                            sx={{padding: "8px 16px", fontSize: "16px"}}
                      >
                          Generate User Rating Report
                      </Button>
                  </Box>

                  <Modal
                        open={modalOpen}
                        onClose={() => {
                            setModalOpen(false)
                            setReportData(null)
                        }}
                  >
                      <Fade in={modalOpen}>
                          <Box sx={{...simpleModalStyle, maxWidth: "600px"}}>
                              <Typography variant="h5" gutterBottom sx={{mb: 2}}>
                                  Generate User Rating Report
                              </Typography>

                              <Grid container spacing={2}>
                                  <Grid item xs={6}>
                                      <FilterSelect
                                            options={centers}
                                            value={selectedCenter}
                                            label="Select Center"
                                            onChange={(e) => setSelectedCenter(e.target.value)}
                                            loading={loadingCenters}
                                            fullWidth={true}

                                      />
                                  </Grid>
                                  <Grid item xs={6}>
                                      <FilterSelect
                                            options={filterExamTypes}
                                            value={selectedExamType}
                                            label="Select Exam Type"
                                            onChange={(e) => setSelectedExamType(e.target.value)}
                                            fullWidth={true}

                                      />
                                  </Grid>

                                  {/* Date Pickers for Start and End Date */}
                                  <Grid item xs={6}>
                                      <DatePicker
                                            label="Select a Date"
                                            value={date ? dayjs(date) : null}
                                            onChange={(newDate) => setDate(newDate ? newDate.format('YYYY-MM-DD') : null)}
                                            sx={{width: "100%"}}
                                      />
                                  </Grid>

                                  {/* Buttons for Generating Report */}
                                  <Grid item xs={12} display="flex" justifyContent="space-between" my={3}>
                                      <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleGenerateReport}
                                            disabled={loadingReport}
                                            sx={{padding: "10px 20px"}}
                                      >
                                          {loadingReport ? <CircularProgress size={24}/> : "Fetch Report"}
                                      </Button>

                                      {reportData?.length > 0 && (
                                            <Button
                                                  variant="contained"
                                                  color="secondary"
                                                  onClick={handleGenerateExcel}
                                                  sx={{padding: "10px 20px"}}
                                            >
                                                Generate Excel Report
                                            </Button>
                                      )}
                                  </Grid>
                                  {reportData?.length === 0 &&
                                        <Alert sx={{mx: "auto"}} severity="warning">No data for this filter</Alert>}
                                  {error && <Alert severity="error">{error}</Alert>}
                              </Grid>

                          </Box>
                      </Fade>
                  </Modal>
              </div>

          </>
    );
}

export function PdfReport({centers, loadingCenters}) {
    const [reportData, setReportData] = useState(null);
    const [pdfModalOpen, setPdfModalOpen] = useState(false);
    const [date, setDate] = useState(null)
    const [selectedCenter, setSelectedCenter] = useState("");
    const [selectedExamType, setSelectedExamType] = useState("");
    const [loadingReport, setLoadingReport] = useState(false);
    const [error, setError] = useState(null);
    const handleGenerateReport = async () => {
        setLoadingReport(true);
        setError(null);
        try {
            const response = await fetch(`/api/admin/attendance/report/user-assignments?date=${date}&centerId=${selectedCenter}&examType=${selectedExamType}`);
            const result = await response.json();

            if (result.status !== 200) {
                setError(result.message);
            } else {
                setReportData(result.data || []);
            }
        } catch (error) {
            setError("Failed to fetch report data.");
        }
        setLoadingReport(false);
    };

    const handleGeneratePDF = async () => {
        const doc = new jsPDF();

        // Add Arabic font
        doc.addFileToVFS("Amiri-Regular.ttf", arabicFontBase64);
        doc.addFont("Amiri-Regular.ttf", "Amiri", "normal");
        doc.setFont("Amiri");

        // Center the main heading
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.setFontSize(18);
        doc.text("تقرير تقييم المستخدم", pageWidth / 2, 22, {align: "center"});

        // Set default styles for left alignment and Arabic font
        doc.autoTableSetDefaults({
            styles: {font: 'Amiri', fontStyle: 'normal', halign: 'left', cellPadding: 3},
        });

        reportData.forEach((item, index) => {
            const yPosition = index === 0 ? 30 : doc.lastAutoTable.finalY + 10; // Manage space between tables

            // Table for user info (Name, Date, Duty, etc.)
            doc.autoTable({
                startY: yPosition,
                theme: 'grid',
                styles: {
                    font: 'Amiri',
                    fontStyle: 'normal',
                    halign: 'left',
                    cellPadding: 3, // Increased padding
                },
                headStyles: {
                    fillColor: [0, 102, 204],
                    textColor: [255, 255, 255],
                    fontSize: 12,
                    font: 'Helvetica', // Use default font for English text
                    fontStyle: 'normal',
                    halign: 'center',
                    cellPadding: 3,
                },
                bodyStyles: {
                    fillColor: [245, 245, 245],
                    textColor: [0, 0, 0],
                    fontSize: 10,
                    font: 'Amiri',
                    fontStyle: 'normal',
                    halign: 'left',
                    cellPadding: 3,
                },
                columnStyles: {
                    0: {cellWidth: 50}, // Narrower label column
                    1: {cellWidth: pageWidth - 50 - 28}, // Wider content column
                },
                head: [['User Info', 'Value']],
                body: [
                    ['Name', item.user.name],
                    ['Attendance date', dayjs(item.date).format('YYYY-MM-DD')],
                    ['Duty', item.duty || 'N/A'],
                    ['Assignment Points', item.userAssignment?.totalPoints || 'N/A'],
                    ['Score', item.userAssignment?.totalScore || 'N/A'],
                    ['Rating', item.userAssignment?.totalRating ? item.userAssignment.totalRating.toFixed(2) + '%' : 'N/A'],
                ],
                margin: {top: 10, left: 14, right: 14},
                tableWidth: 'auto',
            });

            if (item.userAssignment) {
                // Create a custom body for the question/answer section
                const questionBody = [];

                item.userAssignment.questionAnswers.forEach((qa, idx) => {
                    // Add a separator between questions except for the first one
                    if (idx > 0) {
                        questionBody.push([
                            {content: '', colSpan: 2, styles: {fillColor: [220, 220, 220], cellPadding: 0}},
                        ]);
                    }

                    // Add the question title
                    questionBody.push([
                        {
                            content: 'Question:',
                            styles: {font: 'Helvetica', fontStyle: 'bold', fontSize: 9, halign: 'left', cellPadding: 2}
                        },
                        {
                            content: qa.questionTitle,
                            styles: {font: 'Amiri', fontStyle: 'normal', fontSize: 10, halign: 'left', cellPadding: 2}
                        },
                    ]);

                    // Add the selected choice
                    questionBody.push([
                        {
                            content: 'Selected Choice:',
                            styles: {font: 'Helvetica', fontStyle: 'bold', fontSize: 9, halign: 'left', cellPadding: 2}
                        },
                        {
                            content: qa.choiceText,
                            styles: {font: 'Amiri', fontStyle: 'normal', fontSize: 10, halign: 'left', cellPadding: 2}
                        },
                    ]);

                    // Add the comment
                    questionBody.push([
                        {
                            content: 'Comment:',
                            styles: {font: 'Helvetica', fontStyle: 'bold', fontSize: 9, halign: 'left', cellPadding: 2}
                        },
                        {
                            content: qa.comment || 'N/A',
                            styles: {font: 'Amiri', fontStyle: 'normal', fontSize: 10, halign: 'left', cellPadding: 2}
                        },
                    ]);
                });

                // Table for question/answer sections
                doc.autoTable({
                    startY: doc.lastAutoTable.finalY + 10,
                    theme: 'grid',
                    styles: {
                        font: 'Amiri',
                        fontStyle: 'normal',
                        halign: 'left',
                        cellPadding: 3, // Increased padding
                    },
                    bodyStyles: {
                        fillColor: [255, 255, 255],
                        textColor: [0, 0, 0],
                        fontSize: 10,
                        fontStyle: 'normal',
                        halign: 'left',
                        cellPadding: 2, // Increased padding for content
                    },
                    alternateRowStyles: {fillColor: [245, 245, 245]},
                    head: [],
                    body: questionBody,
                    margin: {top: 10, left: 14, right: 14},
                    columnStyles: {
                        0: {cellWidth: 50}, // Narrower label column
                        1: {cellWidth: pageWidth - 50 - 28}, // Wider content column
                    },
                });
            } else {
                // Handle missing userAssignment
                doc.text(
                      "لا توجد بيانات التقييم لهذا المستخدم.",
                      14,
                      doc.lastAutoTable.finalY + 10,
                      {align: "left"}
                );
            }
        });

        doc.save(
              `تقرير_تقييم_المستخدم_${dayjs(date).format('YYYY-MM-DD')}}.pdf`
        );
    };


    const filterExamTypes = [
        {id: "TEACHER", name: "Teacher"},
        {id: "GRADUATE", name: "Graduate"}
    ];

    return (
          <>
              <Box display="flex" justifyContent="center" my={2}>
                  <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => setPdfModalOpen(true)}
                        sx={{padding: "8px 16px", fontSize: "16px"}}
                  >
                      Generate Assignments PDF Report
                  </Button>
              </Box>

              <Modal open={pdfModalOpen} onClose={() => {
                  setPdfModalOpen(false)
                  setReportData(null)
              }}>
                  <Fade in={pdfModalOpen}>
                      <Box sx={{...simpleModalStyle, maxWidth: "600px"}}>
                          <Typography variant="h5" gutterBottom sx={{mb: 2}}>
                              Generate User Assignment PDF Report
                          </Typography>

                          <Grid container spacing={2}>
                              <Grid item xs={6}>
                                  <div>

                                      <FilterSelect
                                            options={centers}
                                            value={selectedCenter}
                                            label="Select Center"
                                            onChange={(e) => setSelectedCenter(e.target.value)}
                                            loading={loadingCenters}
                                            fullWidth={true}
                                      />
                                  </div>
                              </Grid>
                              <Grid item xs={6}>
                                  <FilterSelect
                                        options={filterExamTypes}
                                        value={selectedExamType}
                                        label="Select Exam Type"
                                        onChange={(e) => setSelectedExamType(e.target.value)}
                                        fullWidth={true}
                                  />
                              </Grid>
                              <Grid item xs={6}>
                                  <DatePicker
                                        label="Select a Date"
                                        value={date ? dayjs(date) : null}
                                        onChange={(newDate) => setDate(newDate ? newDate.format('YYYY-MM-DD') : null)}
                                        sx={{width: "100%"}}
                                  />

                              </Grid>

                              <Grid item xs={12} display="flex" justifyContent="space-between" my={3}>
                                  <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleGenerateReport}
                                        disabled={loadingReport}
                                        sx={{padding: "8px 16px"}}
                                  >
                                      {loadingReport ? <CircularProgress size={24}/> : "Fetch Report"}
                                  </Button>
                                  {reportData && reportData?.length > 0 && (
                                        <Button
                                              variant="contained"
                                              color="secondary"
                                              onClick={handleGeneratePDF}
                                              sx={{padding: "8px 16px"}}
                                        >
                                            Generate PDF Report
                                        </Button>
                                  )}
                              </Grid>

                              {reportData?.length === 0 &&
                                    <Alert sx={{mx: "auto"}} severity="warning">No data for this filter</Alert>}
                              {error && <Alert severity="error" sx={{mx: "auto"}}>{error}</Alert>}
                          </Grid>
                      </Box>
                  </Fade>
              </Modal>
          </>
    );
}
