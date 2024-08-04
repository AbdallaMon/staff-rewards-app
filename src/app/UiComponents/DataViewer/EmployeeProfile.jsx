"use client";
import React, {useState, useEffect} from 'react';
import {
    Button,
    Box,
    Typography,
    Modal,
    Container,
    TextField,
    IconButton,
    Avatar,
    Tooltip,
    Link,
    Paper,
    Divider,
    Select,
    MenuItem,
    InputLabel,
    FormControl,
    InputAdornment,
    BottomNavigation,
    BottomNavigationAction,
    List,
    ListItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import {styled} from '@mui/material/styles';
import {useForm, Controller} from 'react-hook-form';
import {IoMdClose, IoMdEye, IoMdCreate, IoMdPerson, IoMdCash, IoMdInformationCircle} from 'react-icons/io';
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";
import FullScreenLoader from "@/app/UiComponents/Feedback/FullscreenLoader";
import PrintBankDetailsButton from "@/app/UiComponents/Templatese/BankdetailsTemplate";

const Input = styled('input')({
    display: 'none',
});

const ModalContent = styled(Box)({
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    width: '400px',
    margin: 'auto',
    marginTop: '15%',
});

const ProfileSection = styled(Paper)(({theme}) => ({
    padding: '16px',
    marginBottom: '16px',
    backgroundColor: theme.palette.background.paper,
    width: '100%',
    maxWidth: "600px",
}));

const DataBox = styled(Box)(({theme}) => ({
    display: "grid",
    gridTemplateColumns: "0.9fr 1.1fr",
    alignItems: "center",
    marginBottom: "12px",
}));

const fetchUserDetails = async (userId) => {
    const response = await fetch(`/api/employee/private/${userId}`);
    const user = await response.json();
    return user.data;
};

const ProfilePage = ({userId}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openModal, setOpenModal] = useState(false);
    const [openImageModal, setOpenImageModal] = useState(false);
    const [fullImageModal, setFullImageModal] = useState(false);
    const [currentField, setCurrentField] = useState('');
    const [currentImageField, setCurrentImageField] = useState('');
    const [editMode, setEditMode] = useState(false);
    const {control, handleSubmit, watch, setValue, formState: {errors}} = useForm();
    const {setLoading: setToastLoading} = useToastContext();
    const [tabIndex, setTabIndex] = useState(0);

    useEffect(() => {
        const loadUserDetails = async () => {
            const data = await fetchUserDetails(userId);
            setUser(data);
            setLoading(false);
        };
        loadUserDetails();
    }, [userId]);

    const handleEditClick = (field) => {
        setCurrentField(field);
        setOpenModal(true);
    };

    const handleImageEditClick = (field) => {
        setCurrentImageField(field);
        setOpenImageModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
    };

    const handleCloseImageModal = () => {
        setOpenImageModal(false);
    };

    const handleCloseFullImageModal = () => {
        setFullImageModal(false);
    };

    const handleFormSubmit = async (data) => {
        const updatedData = {};
        if (data[currentField] !== user[currentField]) {
            updatedData[currentField] = data[currentField];
        }
        if (Object.keys(updatedData).length === 0) {
            handleCloseModal();
            return;
        }
        const res = await handleRequestSubmit(
              updatedData,
              setToastLoading, `employee/private/${user.id}`, false, "Updating...", null, "POST");
        if (res.status === 200) {
            setUser((prev) => ({...prev, ...updatedData}));
            handleCloseModal();
        }
    };

    const handleImageSubmit = async (data) => {
        const formData = new FormData();
        formData.append(currentImageField, data[currentImageField]);
        formData.append("deletedUrl", user[currentImageField])
        const res = await handleRequestSubmit(
              formData, setToastLoading, `employee/private/${user.id}`, true, "Uploading...", null, "PUT");
        if (res.status === 200) {
            setUser((prev) => ({...prev, ...res.data}))
            handleCloseImageModal();
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    const toggleEditMode = () => {
        setEditMode(!editMode);
    };

    if (loading) return <FullScreenLoader/>

    return (
          <Container maxWidth="md">
              <Typography variant="h4" gutterBottom className={"text-secondary"}>Employee Profile</Typography>
              <Button onClick={toggleEditMode} variant="contained" color="primary" sx={{mb: 2}}>
                  {editMode ? "Exit Edit Mode" : "Enter Edit Mode"}
              </Button>
              <Box display={{md: 'flex'}} width="100%">
                  <Box width="25%" mr={2} sx={{
                      display: {md: "block", xs: "none"},
                      pt: 4
                  }}>
                      <List component="nav">
                          <ListItem button selected={tabIndex === 0} onClick={() => setTabIndex(0)}>
                              <ListItemIcon>
                                  <IoMdPerson/>
                              </ListItemIcon>
                              <ListItemText primary="Personal Info"/>
                          </ListItem>
                          <ListItem button selected={tabIndex === 1} onClick={() => setTabIndex(1)}>
                              <ListItemIcon>
                                  <IoMdCash/>
                              </ListItemIcon>
                              <ListItemText primary="Bank Details"/>
                          </ListItem>
                          <ListItem button selected={tabIndex === 2} onClick={() => setTabIndex(2)}>
                              <ListItemIcon>
                                  <IoMdInformationCircle/>
                              </ListItemIcon>
                              <ListItemText primary="Additional Info"/>
                          </ListItem>
                      </List>
                  </Box>
                  <Box sx={{
                      width: {
                          xs: "100%",
                          md: "75%"
                      }
                  }}>
                      <TabPanel value={tabIndex} index={0}>
                          <Box display="flex" flexDirection="column" alignItems="center" height="100%">
                              <ProfileSection>
                                  <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                                      <Avatar src={user.photo} alt="User Photo"
                                              sx={{width: 100, height: 100, mb: 2}}/>
                                      {editMode && (
                                            <IconButton
                                                  onClick={() => handleImageEditClick('photo')}><IoMdCreate/></IconButton>
                                      )}
                                  </Box>
                                  <Typography variant="h6" align="center">Personal Information</Typography>
                                  <Divider sx={{my: 1}}/>
                                  <DataBox>
                                      <Typography variant="body1" color="secondary">Name:</Typography>
                                      <Typography variant="body1">{user.name} {editMode && (
                                            <IconButton
                                                  onClick={() => handleEditClick('name')}><IoMdCreate/></IconButton>
                                      )}</Typography>

                                  </DataBox>
                                  <DataBox>
                                      <Typography variant="body1" color="secondary">Email:</Typography>
                                      <Typography variant="body1">{user.email} {editMode && (
                                            <IconButton
                                                  onClick={() => handleEditClick('email')}><IoMdCreate/></IconButton>
                                      )}</Typography>
                                  </DataBox>
                                  <DataBox>
                                      <Typography variant="body1" color="secondary">Phone:</Typography>
                                      <Typography variant="body1">{user.phone} {editMode && (
                                            <IconButton
                                                  onClick={() => handleEditClick('phone')}><IoMdCreate/></IconButton>
                                      )}</Typography>
                                  </DataBox>
                                  <DataBox>
                                      <Typography variant="body1" color="secondary">Zone:</Typography>
                                      <Typography variant="body1">{user.zone} {editMode && (
                                            <IconButton
                                                  onClick={() => handleEditClick('zone')}><IoMdCreate/></IconButton>
                                      )}</Typography>
                                  </DataBox>
                                  <DataBox>
                                      <Typography variant="body1" color="secondary">Gender:</Typography>
                                      <Typography variant="body1">{user.gender} {editMode && (
                                            <IconButton
                                                  onClick={() => handleEditClick('gender')}><IoMdCreate/></IconButton>
                                      )}</Typography>
                                  </DataBox>
                                  <DataBox>
                                      <Typography variant="body1" color="secondary">Emirates ID:</Typography>
                                      <Typography variant="body1">{user.emiratesId} {editMode && (
                                            <IconButton
                                                  onClick={() => handleEditClick('emiratesId')}><IoMdCreate/></IconButton>
                                      )}</Typography>
                                  </DataBox>
                                  <DataBox>
                                      <Typography variant="body1" color="secondary">Emirates ID Photo:</Typography>
                                      {user.emiratesIdPhoto?.endsWith('.pdf') ? (
                                            <>
                                                <Link href={user.emiratesIdPhoto} target="_blank"
                                                      rel="noopener noreferrer"
                                                      sx={{ml: 1}}>View PDF</Link>
                                                {editMode && (
                                                      <IconButton
                                                            onClick={() => handleImageEditClick('emiratesIdPhoto')}><IoMdCreate/></IconButton>
                                                )}
                                            </>
                                      ) : (
                                            <Box display="flex" alignItems="center" ml={1}>
                                                <Avatar src={user.emiratesIdPhoto} alt="Emirates ID Photo"
                                                        sx={{width: 80, height: 80, mr: 1}}/>
                                                {editMode && (
                                                      <IconButton
                                                            onClick={() => handleImageEditClick('emiratesIdPhoto')}><IoMdCreate/></IconButton>
                                                )}
                                                <Tooltip title="View Full Image">
                                                    <IconButton
                                                          onClick={() => setFullImageModal(user.emiratesIdPhoto)}><IoMdEye/></IconButton>
                                                </Tooltip>
                                            </Box>
                                      )}
                                  </DataBox>
                              </ProfileSection>
                          </Box>
                      </TabPanel>
                      <TabPanel value={tabIndex} index={1}>
                          <Box display="flex" flexDirection="column" alignItems="center" height="100%">
                              <ProfileSection>
                                  <Typography variant="h6" align="center">Bank Information</Typography>
                                  <Divider sx={{my: 1}}/>
                                  <DataBox>
                                      <Typography variant="body1" color="secondary">Bank Name:</Typography>
                                      <Typography variant="body1">{user.bankName} {editMode && (
                                            <IconButton
                                                  onClick={() => handleEditClick('bankName')}><IoMdCreate/></IconButton>
                                      )}</Typography>
                                  </DataBox>
                                  <DataBox>
                                      <Typography variant="body1" color="secondary">Bank User Name:</Typography>
                                      <Typography variant="body1">{user.bankUserName} {editMode && (
                                            <IconButton
                                                  onClick={() => handleEditClick('bankUserName')}><IoMdCreate/></IconButton>
                                      )}</Typography>
                                  </DataBox>
                                  <DataBox>
                                      <Typography variant="body1" color="secondary">IBAN:</Typography>
                                      <Typography variant="body1">{user.ibanBank} {editMode && (
                                            <IconButton
                                                  onClick={() => handleEditClick('ibanBank')}><IoMdCreate/></IconButton>
                                      )}</Typography>
                                  </DataBox>
                                  <DataBox>
                                      <Typography variant="body1" color="secondary">IBAN Bank Photo:</Typography>
                                      {user.ibanBankPhoto?.endsWith('.pdf') ? (
                                            <>
                                                <Link href={user.ibanBankPhoto} target="_blank"
                                                      rel="noopener noreferrer"
                                                      sx={{ml: 1}}>View PDF</Link>
                                                {editMode && (
                                                      <IconButton
                                                            onClick={() => handleImageEditClick('ibanBankPhoto')}><IoMdCreate/></IconButton>
                                                )}
                                            </>
                                      ) : (
                                            <Box display="flex" alignItems="center" ml={1}>
                                                <Avatar src={user.ibanBankPhoto} alt="IBAN Bank Photo"
                                                        sx={{width: 80, height: 80, mr: 1}}/>
                                                {editMode && (
                                                      <IconButton
                                                            onClick={() => handleImageEditClick('ibanBankPhoto')}><IoMdCreate/></IconButton>
                                                )}
                                                <Tooltip title="View Full Image">
                                                    <IconButton
                                                          onClick={() => setFullImageModal(user.ibanBankPhoto)}><IoMdEye/></IconButton>
                                                </Tooltip>
                                            </Box>
                                      )}
                                  </DataBox>
                                  <DataBox>
                                      <Typography variant="body1" color="secondary">Bank Approval
                                          Attachment:</Typography>
                                      {user.bankApprovalAttachment?.endsWith('.pdf') ? (
                                            <>
                                                <Link href={user.bankApprovalAttachment} target="_blank"
                                                      rel="noopener noreferrer"
                                                      sx={{ml: 1}}>View PDF</Link>
                                                {editMode && (
                                                      <IconButton
                                                            onClick={() => handleImageEditClick('bankApprovalAttachment')}><IoMdCreate/></IconButton>
                                                )}
                                            </>
                                      ) : (
                                            <Box display="flex" alignItems="center" ml={1}>
                                                {!user.bankApprovalAttachment ? "No attacments uploaded" :
                                                      <Avatar src={user.bankApprovalAttachment}
                                                              alt="Bank Approval Attachment"
                                                              sx={{width: 80, height: 80, mr: 1}}/>}

                                                {editMode && (
                                                      <IconButton
                                                            onClick={() => handleImageEditClick('bankApprovalAttachment')}><IoMdCreate/></IconButton>
                                                )}
                                                {user.bankApprovalAttachment &&
                                                      <Tooltip title="View Full Image">
                                                          <IconButton
                                                                onClick={() => setFullImageModal(user.bankApprovalAttachment)}><IoMdEye/></IconButton>
                                                      </Tooltip>}
                                            </Box>
                                      )}
                                  </DataBox>
                                  <PrintBankDetailsButton user={user}/>
                              </ProfileSection>
                          </Box>
                      </TabPanel>
                      <TabPanel value={tabIndex} index={2}>
                          <Box display="flex" flexDirection="column" alignItems="center" height="100%">
                              <ProfileSection>
                                  <Typography variant="h6" align="center">Additional Information</Typography>
                                  <Divider sx={{my: 1}}/>
                                  <DataBox>
                                      <Typography variant="body1" color="secondary">Passport Number:</Typography>
                                      <Typography variant="body1">{user.passportNumber} {editMode && (
                                            <IconButton
                                                  onClick={() => handleEditClick('passportNumber')}><IoMdCreate/></IconButton>
                                      )}</Typography>
                                  </DataBox>
                                  <DataBox>
                                      <Typography variant="body1" color="secondary">Passport Photo:</Typography>
                                      {user.passportPhoto?.endsWith('.pdf') ? (
                                            <>
                                                <Link href={user.passportPhoto} target="_blank"
                                                      rel="noopener noreferrer"
                                                      sx={{ml: 1}}>View PDF</Link>
                                                {editMode && (
                                                      <IconButton
                                                            onClick={() => handleImageEditClick('passportPhoto')}><IoMdCreate/></IconButton>
                                                )}
                                            </>
                                      ) : (
                                            <Box display="flex" alignItems="center" ml={1}>
                                                <Avatar src={user.passportPhoto} alt="Passport Photo"
                                                        sx={{width: 80, height: 80, mr: 1}}/>
                                                {editMode && (
                                                      <IconButton
                                                            onClick={() => handleImageEditClick('passportPhoto')}><IoMdCreate/></IconButton>
                                                )}
                                                <Tooltip title="View Full Image">
                                                    <IconButton
                                                          onClick={() => setFullImageModal(user.passportPhoto)}><IoMdEye/></IconButton>
                                                </Tooltip>
                                            </Box>
                                      )}
                                  </DataBox>
                                  <DataBox>
                                      <Typography variant="body1" color="secondary">Graduation Title:</Typography>
                                      <Typography variant="body1">{user.graduationName} {editMode && (
                                            <IconButton
                                                  onClick={() => handleEditClick('graduationName')}><IoMdCreate/></IconButton>
                                      )}</Typography>

                                  </DataBox>
                                  <DataBox>
                                      <Typography variant="body1" color="secondary">Graduation Image:</Typography>
                                      {user.graduationImage?.endsWith('.pdf') ? (
                                            <>
                                                <Link href={user.graduationImage} target="_blank"
                                                      rel="noopener noreferrer"
                                                      sx={{ml: 1}}>View PDF</Link>
                                                {editMode && (
                                                      <IconButton
                                                            onClick={() => handleImageEditClick('graduationImage')}><IoMdCreate/></IconButton>
                                                )}
                                            </>
                                      ) : (
                                            <Box display="flex" alignItems="center" ml={1}>
                                                <Avatar src={user.graduationImage} alt="Graduation Image"
                                                        sx={{width: 80, height: 80, mr: 1}}/>
                                                {editMode && (
                                                      <IconButton
                                                            onClick={() => handleImageEditClick('graduationImage')}><IoMdCreate/></IconButton>
                                                )}
                                                <Tooltip title="View Full Image">
                                                    <IconButton
                                                          onClick={() => setFullImageModal(user.graduationImage)}><IoMdEye/></IconButton>
                                                </Tooltip>
                                            </Box>
                                      )}
                                  </DataBox>
                              </ProfileSection>
                          </Box>
                      </TabPanel>
                  </Box>
              </Box>
              <BottomNavigation
                    value={tabIndex}
                    onChange={(event, newValue) => setTabIndex(newValue)}
                    showLabels
                    sx={{position: 'fixed', bottom: 0, left: 0, right: 0, display: {xs: 'flex', md: 'none'}}}
              >
                  <BottomNavigationAction label="Personal Info" icon={<IoMdPerson/>}/>
                  <BottomNavigationAction label="Bank Details" icon={<IoMdCash/>}/>
                  <BottomNavigationAction label="Additional Info" icon={<IoMdInformationCircle/>}/>
              </BottomNavigation>

              <Modal open={openModal} onClose={handleCloseModal}>
                  <ModalContent>
                      <IconButton onClick={handleCloseModal} style={{float: 'right'}}>
                          <IoMdClose/>
                      </IconButton>
                      <Typography
                            variant="h6">Edit {currentField.charAt(0).toUpperCase() + currentField.slice(1)}</Typography>
                      <form onSubmit={handleSubmit(handleFormSubmit)}>
                          <Controller
                                name={currentField}
                                control={control}
                                defaultValue={user[currentField]}
                                render={({field}) => (
                                      currentField === 'zone' || currentField === 'gender' ? (
                                            <FormControl fullWidth margin="normal">
                                                <InputLabel>{`Edit ${currentField.charAt(0).toUpperCase() + currentField.slice(1)}`}</InputLabel>
                                                <Select
                                                      {...field}
                                                      label={`Edit ${currentField.charAt(0).toUpperCase() + currentField.slice(1)}`}
                                                      error={!!errors[currentField]}
                                                >
                                                    {currentField === 'zone' && ['ABU_DHABI', 'AJMAN', 'DUBAI', 'FUJAIRAH', 'RAS_AL_KHAIMAH', 'SHARJAH', 'UMM_AL_QUWAIN'].map(zone => (
                                                          <MenuItem key={zone} value={zone}>{zone}</MenuItem>
                                                    ))}
                                                    {currentField === 'gender' && ['MALE', 'FEMALE'].map(gender => (
                                                          <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                                                    ))}
                                                </Select>
                                                {errors[currentField] && (
                                                      <Typography color="error" variant="body2">
                                                          {errors[currentField].message}
                                                      </Typography>
                                                )}
                                            </FormControl>
                                      ) : (
                                            <TextField
                                                  {...field}
                                                  fullWidth
                                                  margin="normal"
                                                  label={`Edit ${currentField.charAt(0).toUpperCase() + currentField.slice(1)}`}
                                                  error={!!errors[currentField]}
                                                  helperText={errors[currentField] ? errors[currentField].message : ''}
                                                  InputProps={{
                                                      startAdornment: currentField === 'ibanBank' &&
                                                            <InputAdornment position="start">AE</InputAdornment>,
                                                  }}
                                                  value={field.value}
                                                  onChange={(e) => {
                                                      if (currentField === "ibanBank") {
                                                          if (e.target.value.length === 22) return;
                                                      }
                                                      if (currentField === "emiratesId") {
                                                          if (e.target.value.length === 16) return;
                                                      }
                                                      return field.onChange(e.target.value)
                                                  }}
                                            />
                                      )
                                )}

                                rules={{
                                    required: `${currentField.charAt(0).toUpperCase() + currentField.slice(1)} is required`,
                                    validate: value => {
                                        if (currentField === 'ibanBank' && !/^\d{21}$/.test(value)) {
                                            return 'IBAN must be 21 digits';
                                        }
                                        if (currentField === 'emiratesId' && !/^\d{15}$/.test(value)) {
                                            return 'Emirates ID must be 15 digits';
                                        }
                                        return true;
                                    }
                                }}
                          />
                          <Button type="submit" variant="contained">Save</Button>
                      </form>
                  </ModalContent>
              </Modal>

              <Modal open={openImageModal} onClose={handleCloseImageModal}>
                  <ModalContent>
                      <IconButton onClick={handleCloseImageModal} style={{float: 'right'}}>
                          <IoMdClose/>
                      </IconButton>
                      <Typography variant="h6">Edit {currentImageField.replace(/([A-Z])/g, ' $1').trim()}</Typography>
                      <form onSubmit={handleSubmit(handleImageSubmit)}>
                          <Controller
                                name={currentImageField}
                                control={control}
                                render={({field}) => (
                                      <>
                                          <label htmlFor={currentImageField}>
                                              <Input
                                                    id={currentImageField}
                                                    type="file"
                                                    accept="image/*,application/pdf"
                                                    onChange={(e) => {
                                                        setValue(currentImageField, e.target.files[0]);
                                                        field.onChange(e.target.files[0]);
                                                    }}
                                              />
                                              <Button variant="outlined" component="span" color="primary" fullWidth
                                                      sx={{textTransform: 'capitalize', py: 1.5}}>
                                                  Upload New {currentImageField.replace(/([A-Z])/g, ' $1').trim()}
                                              </Button>
                                          </label>
                                          {field.value && (
                                                <Box mt={2} textAlign="center">
                                                    {field.value.type === 'application/pdf' ? (
                                                          <Link href={URL.createObjectURL(field.value)} target="_blank"
                                                                rel="noopener noreferrer">View PDF</Link>
                                                    ) : (
                                                          <Tooltip title="Full screen">
                                                              <img
                                                                    src={URL.createObjectURL(field.value)}
                                                                    alt={currentImageField}
                                                                    className="w-[200px] max-h-[200px] object-contain"
                                                                    style={{cursor: 'pointer'}}
                                                                    onClick={() => setFullImageModal(URL.createObjectURL(field.value))}
                                                              />
                                                          </Tooltip>
                                                    )}
                                                </Box>
                                          )}
                                      </>
                                )}
                          />
                          <Button type="submit" variant="contained" disabled={!watch(currentImageField)}>Save</Button>
                      </form>
                  </ModalContent>
              </Modal>

              <Modal open={!!fullImageModal} onClose={handleCloseFullImageModal}>
                  <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100vh',
                            bgcolor: 'rgba(0, 0, 0, 0.8)',
                            p: 4,
                        }}
                  >
                      <IconButton onClick={handleCloseFullImageModal}
                                  sx={{position: 'absolute', top: 16, right: 16, color: '#fff'}}>
                          <IoMdClose/>
                      </IconButton>
                      {fullImageModal && (
                            <img src={fullImageModal} alt="Full View" style={{maxHeight: '90%', maxWidth: '90%'}}/>
                      )}
                  </Box>
              </Modal>
          </Container>
    );
};

const TabPanel = ({children, value, index, ...other}) => {
    return (
          <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
          >
              {value === index && (
                    <Box sx={{
                        p: {
                            sx: 1, md: 3
                        }
                        , mt: 2
                    }}>
                        {children}
                    </Box>
              )}
          </div>
    );
};

export default ProfilePage;
