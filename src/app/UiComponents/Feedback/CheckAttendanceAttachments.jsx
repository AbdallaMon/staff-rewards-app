"use client";
import {useSelector} from "react-redux";
import React, {useEffect, useState} from "react";
import {useToastContext} from "@/providers/ToastLoadingProvider";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {Box, Button, Card, CardContent, Container, Grid, TextField, Typography} from "@mui/material";
import FullScreenLoader from "@/app/UiComponents/Feedback/FullscreenLoader";
import PrintButton from "@/app/UiComponents/Templatese/AttendanceTemplate";

export default function CheckAttendanceAttachments({children}) {
    let {data} = useSelector((state) => state.auth);
    const [dayAttendances, setDayAttendances] = useState([]);
    const [duties, setDuties] = useState([]);
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const {setLoading: setToastLoading} = useToastContext();

    useEffect(() => {
        const fetchDayAttendances = async () => {
            try {
                const [dayAttendancesRes, dutiesRes, shiftsRes] = await Promise.all([
                    fetch(`/api/employee/private/${data.id}/day-attendances`),
                    fetch(`/api/index?id=duty`),
                    fetch(`/api/index?id=shift`),
                ]);

                const dayAttendancesData = await dayAttendancesRes.json();
                const dutiesData = await dutiesRes.json();
                const shiftsData = await shiftsRes.json();

                if (dayAttendancesRes.ok && dutiesRes.ok && shiftsRes.ok) {
                    setDayAttendances(dayAttendancesData.data);
                    setDuties(dutiesData.data);
                    setShifts(shiftsData.data);
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

    const upload = async (e, dayAttendanceId) => {
        e.preventDefault();
        const formData = new FormData(e.target);

        const res = await handleRequestSubmit(formData, setToastLoading, `employee/private/${data.id}/day-attendances/${dayAttendanceId}/attachment`, true, "Uploading", false, "POST");

        if (res.status === 200) {
            const newData = dayAttendances.filter((day) => +day.id !== +dayAttendanceId);
            setDayAttendances(newData);
        }
    };

    if (error) return <Typography variant="h6" color="error">{error}</Typography>;
    if (!loading && !dayAttendances) {
        return children;
    }
    return (
          <Container>
              {loading && <FullScreenLoader/>}
              <Typography variant="h4" gutterBottom>
                  {!loading && "Day attendances that need approval from you"}
              </Typography>
              <Grid container spacing={3}>
                  {dayAttendances.map((dayAttendance) => (
                        <Grid item xs={12} md={6} lg={4} key={dayAttendance.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">
                                        Date: {new Date(dayAttendance.date).toLocaleDateString()}
                                    </Typography>
                                    <Box mt={2}>
                                        <PrintButton
                                              user={dayAttendance.user}
                                              dayAttendance={dayAttendance}
                                              duties={duties}
                                              shifts={shifts}
                                        />
                                    </Box>
                                    <AttachmentForm
                                          dayAttendance={dayAttendance}
                                          upload={upload}
                                    />
                                </CardContent>
                            </Card>
                        </Grid>
                  ))}
              </Grid>
          </Container>
    );
}

const AttachmentForm = ({dayAttendance, upload}) => {
    const [file, setFile] = useState(null);
    const [fileType, setFileType] = useState(null);
    const [objectURL, setObjectURL] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            const fileExtension = selectedFile.name.split('.').pop().toLowerCase();
            if (fileExtension === 'pdf' || ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
                setFile(selectedFile);
                setFileType(fileExtension);
                if (fileExtension !== 'pdf') {
                    const url = URL.createObjectURL(selectedFile);
                    setObjectURL(url);
                } else {
                    setObjectURL(null);
                }
            } else {
                setFile(null);
                setFileType(null);
                setObjectURL(null);
            }
        }
    };

    return (
          <form onSubmit={(e) => upload(e, dayAttendance.id)}>
              <Box mt={2} sx={{
                  display: "flex", gap: 2, alignItems: "center"
              }}>
                  <TextField
                        type="file"
                        name="attachment"
                        accept="application/pdf, image/*"
                        id={`attachment-${dayAttendance.id}`}
                        required
                        fullWidth
                        onChange={handleFileChange}
                  />
                  <Box mt={2}>
                      {file && fileType === 'pdf' && <Typography>{file.name}</Typography>}
                      {file && fileType !== 'pdf' &&
                            <img src={objectURL} alt="attachment preview"
                                 style={{maxWidth: "200px", maxHeight: "300px"}}/>}
                      {fileType && !['pdf', 'jpg', 'jpeg', 'png', 'gif'].includes(fileType) &&
                            <Typography color="error">Unsupported file type</Typography>}
                  </Box>
              </Box>
              <Box mt={2} display="flex" justifyContent="flex-end">
                  <Button type="submit" variant="contained" color="primary" disabled={!file}>
                      Upload Attachment
                  </Button>
              </Box>
          </form>
    );
};
