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
    Button,
    Container
} from '@mui/material';
import { FaTimes } from 'react-icons/fa';
import CreateModal from "@/app/UiComponents/Models/CreateModal";
import UncompletedModal from "@/app/UiComponents/Models/UncompletedModal";

const fetchUserById = async (userId) => {
    const response = await fetch(`/api/admin/employees/${userId}`);
    const result = await response.json();
    return result;
};

const UserDetailDrawer = ({ userId, open, onClose, renderExtraButtons, setData }) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] =useState(true);
    const [error, setError] = useState(null);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [uncompletedModalOpen, setUncompletedModalOpen] = useState(false);

    useEffect(() => {
        if (userId) {
            setLoading(true);
            setError(null);
            fetchUserById(userId).then(response => {
                if (response.status === 200) {
                    setUserData(response.data);
                } else {
                    setError(response.message);
                }
                setLoading(false);
            }).catch((err) => {
                setError("An error occurred while fetching the user data.");
                setLoading(false);
            });
        }
    }, [userId]);

    const handleImageClick = (image) => {
        setSelectedImage(image);
        setImageModalOpen(true);
    };

    const handleImageModalClose = () => {
        setSelectedImage(null);
        setImageModalOpen(false);
    };

    const handleReject = (data) => {
        setRejectModalOpen(false);
        setData((prevData) => prevData.filter(user => user.id !== userId));
        onClose();
    };

    const handleApprove = (data) => {
        setApproveModalOpen(false);
        setData((prevData) => prevData.filter(user => user.id !== userId));
        onClose();
    };

    const handleUncompleted = (data) => {
        setUncompletedModalOpen(false);
        setData((prevData) => prevData.filter(user => user.id !== userId));
        onClose();
    };

    return (
          <>
              <Drawer anchor="bottom" open={open} onClose={onClose} sx={{
                  // zIndex: 1
              }}>
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
                      {!loading && userData && (
                            <Box>
                                <Typography variant="h5" gutterBottom>User Details</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                            {userData.photo ? (
                                                  <Avatar
                                                        src={userData.photo}
                                                        sx={{ width: 120, height: 120, cursor: 'pointer', marginRight: 2 }}
                                                        onClick={() => handleImageClick(userData.photo)}
                                                  />
                                            ) : (
                                                  <Typography>No User Photo</Typography>
                                            )}
                                            <List>
                                                <ListItem>
                                                    <ListItemText primary="Name" secondary={userData.name || "N/A"} />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemText primary="Email" secondary={userData.email || "N/A"} />
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemText primary="Center" secondary={userData.center?.name || "N/A"} />
                                                </ListItem>
                                            </List>
                                        </Box>
                                        <Divider />
                                        <List>
                                            <ListItem>
                                                <ListItemText primary="Duty" secondary={userData.duty?.name || "N/A"} />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemText primary="Rating" secondary={userData.rating || "N/A"} />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemText primary="Phone" secondary={userData.phone || "N/A"} />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemText primary="Bank Name" secondary={userData.bankName || "N/A"} />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemText primary="Bank User Name" secondary={userData.bankUserName || "N/A"} />
                                            </ListItem>
                                        </List>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <List>
                                            <ListItem>
                                                <ListItemText primary="Emirates ID" secondary={userData.emiratesId || "N/A"} />
                                                {userData.emiratesIdPhoto ? (
                                                      <Avatar
                                                            src={userData.emiratesIdPhoto}
                                                            sx={{ width: 80, height: 80, cursor: 'pointer', ml: 2 }}
                                                            onClick={() => handleImageClick(userData.emiratesIdPhoto)}
                                                      />
                                                ) : (
                                                      <Typography>No Emirates ID Photo</Typography>
                                                )}
                                            </ListItem>
                                            <ListItem>
                                                <ListItemText primary="IBAN" secondary={userData.ibanBank || "N/A"} />
                                                {userData.ibanBankPhoto ? (
                                                      <Avatar
                                                            src={userData.ibanBankPhoto}
                                                            sx={{ width: 80, height: 80, cursor: 'pointer', ml: 2 }}
                                                            onClick={() => handleImageClick(userData.ibanBankPhoto)}
                                                      />
                                                ) : (
                                                      <Typography>No IBAN Photo</Typography>
                                                )}
                                            </ListItem>
                                            <ListItem>
                                                <ListItemText primary="Graduation Name" secondary={userData.graduationName || "N/A"} />
                                                {userData.graduationImage ? (
                                                      <Avatar
                                                            src={userData.graduationImage}
                                                            sx={{ width: 80, height: 80, cursor: 'pointer', ml: 2 }}
                                                            onClick={() => handleImageClick(userData.graduationImage)}
                                                      />
                                                ) : (
                                                      <Typography>No Graduation Image</Typography>
                                                )}
                                            </ListItem>
                                            <ListItem>
                                                <ListItemText primary="Passport Number" secondary={userData.passportNumber || "N/A"} />
                                                {userData.passportPhoto ? (
                                                      <Avatar
                                                            src={userData.passportPhoto}
                                                            sx={{ width: 80, height: 80, cursor: 'pointer', ml: 2 }}
                                                            onClick={() => handleImageClick(userData.passportPhoto)}
                                                      />
                                                ) : (
                                                      <Typography>No Passport Photo</Typography>
                                                )}
                                            </ListItem>
                                        </List>
                                    </Grid>
                                </Grid>
                                {renderExtraButtons && (
                                      <Box sx={{mt: 2, display: 'flex', justifyContent: 'center', gap: 4}}>
                                          <CreateModal
                                                open={rejectModalOpen}
                                                onClose={() => setRejectModalOpen(false)}
                                                handleSubmit={handleReject}
                                                title="Reject Reason"
                                                inputs={[
                                                    {
                                                        data: {id: "reason", type: "textarea", label: "Reason"},
                                                        pattern: {
                                                            required: {
                                                                value: true,
                                                                message: "Please provide a reason for rejection"
                                                            }
                                                        }
                                                    }
                                                ]}
                                                label="Reject"
                                                extraProps={{formTitle: "Reject Reason", btnText: "Reject"}}
                                                BtnColor="secondary"
                                                href={`admin/employees/${userId}/reject`}
                                          />
                                          <CreateModal
                                                open={approveModalOpen}
                                                onClose={() => setApproveModalOpen(false)}
                                                handleSubmit={handleApprove}
                                                title="Approve User"
                                                BtnColor="primary"
                                                inputs={[
                                                    {
                                                        data: {id: "password", type: "password", label: "Password"},
                                                        pattern: {
                                                            required: {
                                                                value: true,
                                                                message: "Please provide a password"
                                                            }
                                                        }
                                                    },
                                                    {
                                                        data: {
                                                            id: "examType",
                                                            type: "SelectField",
                                                            label: "Exam Type",
                                                            options: [{id: "TEACHER", value: "Teacher"}, {
                                                                id: "STUDENT",
                                                                value: "Student"
                                                            }],
                                                            loading: false
                                                        },
                                                        pattern: {
                                                            required: {
                                                                value: true,
                                                                message: "Please select an exam type"
                                                            }
                                                        }
                                                    }
                                                ]}
                                                label="Approve"
                                                extraProps={{formTitle: "Approve User", btnText: "Approve"}}
                                                href={`admin/employees/${userId}/approve`}
                                          />
                                          <div className={"px-2 mb-1 mt-2"}>

                                              <Button variant="contained" color="tertiary"
                                                      onClick={() => setUncompletedModalOpen(true)}>
                                                  Uncompleted
                                              </Button>
                                          </div>
                                      </Box>
                                    )}
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
              {renderExtraButtons && (
                    <>
                        <UncompletedModal
                              open={uncompletedModalOpen}
                              onClose={() => setUncompletedModalOpen(false)}
                              handleSubmit={handleUncompleted}
                              title="Uncompleted Details"
                              href={`admin/employees/${userId}/uncompleted`}
                        />
                    </>
              )}
          </>
    );
};

export default UserDetailDrawer;
