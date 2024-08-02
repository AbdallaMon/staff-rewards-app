"use client";
import React, {useEffect, useState} from 'react';
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
    Link,
    Checkbox,
    Button
} from '@mui/material';
import {FaTimes, FaEdit} from 'react-icons/fa';
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";

const fetchAttendanceById = async (dayAttendanceId, center) => {
    const response = await fetch(center ? `/api/center/attendance/${dayAttendanceId}` : `/api/financial/attendance/${dayAttendanceId}`);
    const result = await response.json();
    return result;
};

const updateAttendance = async (dayAttendanceId, editedAttendances, deletedAttendances, center) => {
    const response = await fetch(center ? `/api/center/attendance/${dayAttendanceId}` : `/api/financial/attendance/${dayAttendanceId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({editedAttendances, deletedAttendances})
    });
    const result = await response.json();
    return result;
};

const AttendanceDetailDrawer = ({dayAttendanceId, open, onClose, center, setData}) => {
    const [attendanceData, setAttendanceData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [checkedShifts, setCheckedShifts] = useState({});
    const [editedAttendances, setEditedAttendances] = useState([]);
    const [deletedAttendances, setDeletedAttendances] = useState([]);
    const {setLoading: setSubmitLoading} = useToastContext();

    useEffect(() => {
        if (dayAttendanceId) {
            setLoading(true);
            setError(null);
            fetchAttendanceById(dayAttendanceId, center).then(response => {
                if (response.status === 200) {
                    const attendances = response.data.attendances.reduce((acc, attendance) => {
                        acc[attendance.shiftId] = true;
                        return acc;
                    }, {});
                    setAttendanceData(response.data);
                    setCheckedShifts(attendances);
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

    const handleEditClick = () => {
        setEditModalOpen(true);
    };

    const handleEditModalClose = () => {
        setEditModalOpen(false);
    };

    const handleCheckboxChange = (shiftId, attended) => {
        setCheckedShifts(prev => ({...prev, [shiftId]: attended}));

        if (attended) {
            // Add to editedAttendances only if it is not already attended
            if (!attendanceData.attendances.some(attendance => attendance.shiftId === shiftId)) {
                setEditedAttendances(prev => [...prev, shiftId]);
            }
            setDeletedAttendances(prev => prev.filter(id => id !== shiftId));
        } else {
            if (attendanceData.attendances.some(attendance => attendance.shiftId === shiftId)) {
                setDeletedAttendances(prev => [...prev, shiftId]);
            }
            setEditedAttendances(prev => prev.filter(id => id !== shiftId));
        }
    };

    const handleSubmit = async () => {
        const href = center ? `center/attendance/${dayAttendanceId}` : `financial/attendance/${dayAttendanceId}`;
        const dutyAmount = attendanceData.user.duty.amount;
        const otherData = {
            centerId: attendanceData.centerId,
            userId: attendanceData.userId,
            dutyId: attendanceData.user.duty.id,
            amount: dutyAmount,
            date: attendanceData.date,
            dutyName: attendanceData.user.duty.name
        }
        const response = await handleRequestSubmit({
            editedAttendances,
            deletedAttendances, ...otherData
        }, setSubmitLoading, href, false, "Updating", false, "PUT");
        if (response.status === 200) {
            setData((prev) => prev.map((item) => {
                      if (item.id === dayAttendanceId) {
                          const numberOfShifts = attendanceData.attendances.length + editedAttendances.length - deletedAttendances.length;
                          item.numberOfShifts = numberOfShifts;
                          item.reward = numberOfShifts * dutyAmount;
                      }
                      return item
                  }
            ))
            setDeletedAttendances([]);
            setEditedAttendances([]);
            onClose();
            setEditModalOpen(false);
        } else {
            setError(response.message);
        }
    };

    const isToday = new Date().toDateString() === new Date(attendanceData?.date).toDateString();
    return (
          <>
              <Drawer anchor="bottom" open={open} onClose={onClose} sx={{}}>
                  <Container maxWidth="xl"
                             sx={{p: 2, height: '100vh', overflow: 'auto', position: 'relative', zIndex: 1}}>
                      <IconButton onClick={onClose} sx={{position: 'absolute', right: 16, top: 16}}>
                          <FaTimes/>
                      </IconButton>
                      {loading && (
                            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                                <CircularProgress/>
                            </Box>
                      )}
                      {!loading && error && (
                            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%'}}>
                                <Typography variant="h6">{error}</Typography>
                            </Box>
                      )}
                      {!loading && attendanceData && (
                            <Box>
                                <Typography variant="h5" gutterBottom>Attendance Details</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" gutterBottom color="primary">User Details</Typography>
                                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                            {attendanceData.user.photo ? (
                                                  <Avatar
                                                        src={attendanceData.user.photo}
                                                        sx={{
                                                            width: 120,
                                                            height: 120,
                                                            cursor: 'pointer',
                                                            marginRight: 2
                                                        }}
                                                        onClick={() => handleImageClick(attendanceData.user.photo)}
                                                  />
                                            ) : (
                                                  <Typography>No User Photo</Typography>
                                            )}
                                            <List>
                                                <ListItem>
                                                    <ListItemText primary="Name"
                                                                  secondary={attendanceData.user.name || "N/A"}/>
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemText primary="Email"
                                                                  secondary={attendanceData.user.email || "N/A"}/>
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemText primary="Emirates ID"
                                                                  secondary={attendanceData.user.emiratesId || "N/A"}/>
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemText primary="Rating"
                                                                  secondary={attendanceData.user.rating || "N/A"}/>
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemText primary="Duty"
                                                                  secondary={attendanceData.user.duty.name || "N/A"}/>
                                                </ListItem>
                                            </List>
                                        </Box>
                                        <Divider/>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <Typography variant="h6" color="primary">Attended Shifts</Typography>
                                        <Typography variant="subtitle1" color="secondary">Exam
                                            Type: {attendanceData.examType || "N/A"}</Typography>
                                        <Typography variant="subtitle1"
                                                    color="secondary">Date: {new Date(attendanceData.date).toLocaleDateString() || "N/A"}</Typography>
                                        <List>
                                            {attendanceData.attendances.map((attendance, index) => (
                                                  <ListItem key={index}>
                                                      <ListItemText
                                                            primary={`Shift: ${attendance.shift.name}`}
                                                            secondary={`Duration: ${attendance.shift.duration} hours`}
                                                      />
                                                      <List>
                                                          {attendance.dutyRewards?.map((reward, idx) => (
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
                                        <Divider/>
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
                                        {center && isToday && (
                                              <Button variant="contained" color="primary" onClick={handleEditClick}>
                                                  <FaEdit/> Edit Attendance
                                              </Button>
                                        )}
                                        {!isToday && center && (
                                              <Typography variant="h6" color="error">You can&apos;t edit this because
                                                  the exam has ended.</Typography>
                                        )}
                                        {!center && (
                                              <Button variant="contained" color="primary" onClick={handleEditClick}>
                                                  <FaEdit/> Edit Attendance
                                              </Button>
                                        )}
                                    </Grid>
                                </Grid>
                            </Box>
                      )}
                  </Container>
              </Drawer>
              <Modal open={editModalOpen} onClose={handleEditModalClose}
                     sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                  <Box sx={{p: 2, backgroundColor: 'white', borderRadius: 2, minWidth: 300}}>
                      <Typography variant="h6">Edit Attendance</Typography>
                      <List>
                          {attendanceData?.allShifts?.map((shift) => {
                              const attended = checkedShifts[shift.id] || false;
                              return (
                                    <ListItem key={shift.id}>
                                        <Checkbox
                                              checked={attended}
                                              onChange={(e) => handleCheckboxChange(shift.id, e.target.checked)}
                                        />
                                        <ListItemText primary={shift.name}/>
                                        <span>{shift.duration} hr</span>
                                    </ListItem>
                              );
                          })}
                      </List>
                      <Button variant="contained" color="primary" onClick={handleSubmit}>Save Changes</Button>
                  </Box>
              </Modal>
              {selectedImage && (
                    <Modal open={imageModalOpen} onClose={handleImageModalClose}
                           sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        <Box sx={{position: 'relative', maxWidth: '90%', maxHeight: '90%'}}>
                            <IconButton onClick={handleImageModalClose}
                                        sx={{position: 'absolute', top: 0, right: 0, color: 'white'}}>
                                <FaTimes/>
                            </IconButton>
                            <img src={selectedImage} alt="User Document"
                                 style={{width: '100%', height: '100%', objectFit: 'contain'}}/>
                        </Box>
                    </Modal>
              )}
          </>
    );
};

export default AttendanceDetailDrawer;
