"use client";
import React, { useEffect, useState } from 'react';
import {
    Box,
    CircularProgress,
    Drawer,
    Typography,
    List,
    ListItem,
    ListItemText,
    Avatar,
    IconButton,
    Grid,
    Divider,
    Modal,
    Container,
    Link
} from '@mui/material';
import { FaTimes } from 'react-icons/fa';

const fetchAttendanceById = async (dayAttendanceId, center) => {
    const response = await fetch(center ? `/api/center/attendance/${dayAttendanceId}` : `/api/attendance/${dayAttendanceId}`);
    const result = await response.json();
    return result;
};

const AttendanceDetailDrawer = ({ dayAttendanceId, open, onClose, center }) => {
    const [attendanceData, setAttendanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        if (dayAttendanceId) {
            setLoading(true);
            setError(null);
            fetchAttendanceById(dayAttendanceId, center).then(response => {
                if (response.status === 200) {
                    setAttendanceData(response.data);
                } else {
                    setError(response.message);
                }
                setLoading(false);
            }).catch(() => {
                setError("An error occurred while fetching the attendance data.");
                setLoading(false);
            });
        }
    }, [dayAttendanceId]);

    const handleImageClick = (image) => {
        setSelectedImage(image);
        setImageModalOpen(true);
    };

    const handleImageModalClose = () => {
        setSelectedImage(null);
        setImageModalOpen(false);
    };

    const renderDocument = (label, value) => (
          <ListItem>
              <ListItemText primary={label} secondary={value ? (value.toLowerCase().endsWith('.pdf') ? "" : value) : "N/A"} />
              {value && (
                    value.toLowerCase().endsWith('.pdf') ? (
                          <Link href={value} target="_blank" sx={{ ml: 2 }}>
                              PDF file. Click to open link.
                          </Link>
                    ) : (
                          <Avatar
                                src={value}
                                sx={{ width: 80, height: 80, cursor: 'pointer', ml: 2 }}
                                onClick={() => handleImageClick(value)}
                          />
                    )
              )}
          </ListItem>
    );

    return (
          <>
              <Drawer anchor="bottom" open={open} onClose={onClose} sx={{}}>
                  <Container maxWidth="xl" sx={{ p: 2, height: '100vh', overflow: 'auto', position: 'relative', zIndex: 1 }}>
                      <IconButton onClick={onClose} sx={{ position: 'absolute', right: 16, top: 16 }}>
                          <FaTimes />
                      </IconButton>
                      {loading && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <CircularProgress />
                            </Box>
                      )}
                      {!loading && error && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                <Typography variant="h6">{error}</Typography>
                            </Box>
                      )}
                      {!loading && attendanceData && (
                            <Box>
                                <Typography variant="h5" gutterBottom>Attendance Details</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" gutterBottom color="primary">User Details</Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            {attendanceData.user.photo ? (
                                                  <Avatar
                                                        src={attendanceData.user.photo}
                                                        sx={{ width: 120, height: 120, cursor: 'pointer', marginRight: 2 }}
                                                        onClick={() => handleImageClick(attendanceData.user.photo)}
                                                  />
                                            ) : (
                                                  <Typography>No User Photo</Typography>
                                            )}
                                            <List>
                                                <ListItem>
                                                    <ListItemText primary="Name" secondary={attendanceData.user.name || "N/A"} />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemText primary="Email" secondary={attendanceData.user.email || "N/A"} />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemText primary="Emirates ID" secondary={attendanceData.user.emiratesId || "N/A"} />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemText primary="Rating" secondary={attendanceData.user.rating || "N/A"} />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemText primary="Duty" secondary={attendanceData.user.duty.name || "N/A"} />
                                                </ListItem>
                                            </List>
                                        </Box>
                                        <Divider />
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" color="primary">Attended Shifts</Typography>
                                        <Typography variant="subtitle1" color="secondary">Exam Type: {attendanceData.examType || "N/A"}</Typography>
                                        <Typography variant="subtitle1" color="secondary">Date: {new Date(attendanceData.date).toLocaleDateString() || "N/A"}</Typography>

                                        <List>
                                            {attendanceData.attendances.map((attendance, index) => (
                                                  <ListItem key={index}>
                                                      <ListItemText
                                                            primary={`Shift: ${attendance.shift.name}`}
                                                            secondary={`Duration: ${attendance.shift.duration} hours`}
                                                      />
                                                      <List>
                                                          {attendance.dutyRewards.map((reward, idx) => (
                                                                <ListItem key={idx}>
                                                                    <ListItemText
                                                                          primary={`Duty: ${reward.duty.name}`}
                                                                          secondary={`Amount: ${reward.amount}`}
                                                                    />
                                                                </ListItem>
                                                          ))}
                                                      </List>
                                                  </ListItem>
                                            ))}
                                        </List>
                                        <Divider />
                                        <Typography variant="h6" color="primary">Unattended Shifts</Typography>
                                        <List>
                                            {attendanceData.unattendedShifts.map((shift, index) => (
                                                  <ListItem key={index}>
                                                      <ListItemText
                                                            primary={`Shift: ${shift.name}`}
                                                            secondary={`Duration: ${shift.duration} hours`}
                                                      />
                                                  </ListItem>
                                            ))}
                                        </List>
                                    </Grid>
                                </Grid>
                            </Box>
                      )}
                  </Container>
              </Drawer>
              {selectedImage && (
                    <Modal open={imageModalOpen} onClose={handleImageModalClose} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Box sx={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
                            <IconButton onClick={handleImageModalClose} sx={{ position: 'absolute', top: 0, right: 0, color: 'white' }}>
                                <FaTimes />
                            </IconButton>
                            <img src={selectedImage} alt="User Document" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </Box>
                    </Modal>
              )}
          </>
    );
};

export default AttendanceDetailDrawer;
