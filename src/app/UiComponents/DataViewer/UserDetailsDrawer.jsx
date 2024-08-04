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
    Button,
    Container,
    Link, Fade
} from '@mui/material';
import {FaTimes} from 'react-icons/fa';
import CreateModal from "@/app/UiComponents/Models/CreateModal";
import UncompletedModal from "@/app/UiComponents/Models/UncompletedModal";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";
import {simpleModalStyle} from "@/app/constants";

const fetchUserById = async (userId) => {
    const response = await fetch(`/api/admin/employees/${userId}`);
    const result = await response.json();
    return result;
};

const UserDetailDrawer = ({userId, open, onClose, renderExtraButtons, setData}) => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [rejectModalOpen, setRejectModalOpen] = useState(false);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    const [uncompletedModalOpen, setUncompletedModalOpen] = useState(false);
    const {setLoading: setSubmitLoading} = useToastContext()
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
            }).catch(() => {
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

    const handleApprove = async (data) => {
        const res = await handleRequestSubmit({}, setSubmitLoading, `admin/employees/${userId}/approve`, false, "Approving")
        if (res.status === 200) {

            setApproveModalOpen(false);
            setData((prevData) => prevData.filter(user => user.id !== userId));
            onClose();
        }
    };

    const handleUncompleted = (data) => {
        setUncompletedModalOpen(false);
        setData((prevData) => prevData.filter(user => user.id !== userId));
        onClose();
    };

    const isPdf = (url) => url ? url.toLowerCase().endsWith('pdf') : null

    const renderDocument = (label, value) => {

        return (

              <ListItem>
                  <ListItemText primary={label} secondary={!value && "N/A"}/>
                  {value && (
                        isPdf(value) ? (
                              <Link href={value} target="_blank" sx={{ml: 2}}>
                                  PDF. Click to open.
                              </Link>
                        ) : (
                              <Avatar
                                    src={value}
                                    sx={{width: 80, height: 80, cursor: 'pointer', ml: 2}}
                                    onClick={() => handleImageClick(value)}
                              />
                        )
                  )}
              </ListItem>
        )
    }


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
                      {!loading && userData && (
                            <Box>
                                <Typography variant="h5" gutterBottom>User Details</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} md={6}>
                                        <Box sx={{display: 'flex', alignItems: 'center', mb: 2}}>
                                            {userData.photo ? (
                                                  <Avatar
                                                        src={userData.photo}
                                                        sx={{
                                                            width: 120,
                                                            height: 120,
                                                            cursor: 'pointer',
                                                            marginRight: 2
                                                        }}
                                                        onClick={() => handleImageClick(userData.photo)}
                                                  />
                                            ) : (
                                                  <Typography>No User Photo</Typography>
                                            )}
                                            <List>
                                                <ListItem>
                                                    <ListItemText primary="Name" secondary={userData.name || "N/A"}/>
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemText primary="Email" secondary={userData.email || "N/A"}/>
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemText primary="Center"
                                                                  secondary={userData.center?.name || "N/A"}/>
                                                </ListItem>
                                                <ListItem>
                                                    <ListItemText primary="Zone" secondary={userData.zone || "N/A"}/>
                                                </ListItem>
                                            </List>
                                        </Box>
                                        <Divider/>
                                        <List>
                                            <ListItem>
                                                <ListItemText primary="Duty" secondary={userData.duty?.name || "N/A"}/>
                                            </ListItem>
                                            <ListItem>
                                                <ListItemText primary="Rating" secondary={userData.rating || "N/A"}/>
                                            </ListItem>
                                            <ListItem>
                                                <ListItemText primary="Phone" secondary={userData.phone || "N/A"}/>
                                            </ListItem>
                                            <ListItem>
                                                <ListItemText primary="Bank Name"
                                                              secondary={userData.bankName || "N/A"}/>
                                            </ListItem>
                                            <ListItem>
                                                <ListItemText primary="Bank User Name"
                                                              secondary={userData.bankUserName || "N/A"}/>
                                            </ListItem>
                                        </List>
                                    </Grid>
                                    <Grid item xs={12} md={6}>
                                        <List>
                                            {renderDocument("Emirates ID", userData.emiratesIdPhoto)}
                                            {renderDocument("IBAN", userData.ibanBankPhoto)}
                                            {renderDocument("Graduation Name", userData.graduationImage)}
                                            {renderDocument("Passport Number", userData.passportPhoto)}
                                        </List>
                                    </Grid>
                                </Grid>
                                {renderExtraButtons && (
                                      <Box sx={{
                                          mt: 2,
                                          display: 'flex',
                                          justifyContent: 'center',
                                          gap: 4,
                                          width: "100%",
                                          flexWrap: "wrap"
                                      }}>
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
                                          <Modal
                                                open={approveModalOpen}
                                                onClose={() => setApproveModalOpen(false)}
                                                sx={{
                                                    z: 999,
                                                }}
                                          >
                                              <Fade in={open}>
                                                  <Box sx={{...simpleModalStyle}}>

                                                      <Typography variant="h4" mb={2}>
                                                          Are you sure you want to approve this account?
                                                      </Typography>
                                                      <Button onClick={handleApprove} variant="contained">
                                                          Approve
                                                      </Button>
                                                      <Button onClick={() => setApproveModalOpen(false)}
                                                              variant="contained" color="secondary" sx={{
                                                          marginLeft: "10px"
                                                      }}>
                                                          Cancel
                                                      </Button>
                                                  </Box>
                                              </Fade>
                                          </Modal>
                                          <div className={"px-2 mb-1 mt-2"}>

                                              <Button variant="contained" color="primary"
                                                      onClick={() => setApproveModalOpen(true)}>
                                                  Approve
                                              </Button>
                                          </div>
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
