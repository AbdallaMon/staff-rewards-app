"use client";
import React, {useState, useEffect} from 'react';
import {
    Button,
    Box,
    Typography,
    Modal,
    Grid,
    Container,
    TextField,
    CircularProgress,
    IconButton,
    Avatar,
    Tooltip,
    Link,
    Paper,
    Divider,
    Select,
    MenuItem,
    InputLabel,
    FormControl, InputAdornment,
} from '@mui/material';
import {styled} from '@mui/material/styles';
import {useForm, Controller} from 'react-hook-form';
import {IoMdClose, IoMdEye, IoMdCreate} from 'react-icons/io';
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";

const Input = styled('input')({
    display: 'none',
});

// Styled components
const ModalContent = styled(Box)({
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
    width: '400px',
    margin: 'auto',
    marginTop: '15%',
});

const ProfileSection = styled(Paper)({
    padding: '16px',
    marginBottom: '16px',
    backgroundColor: '#f0f4f5',
    height: "100%"
});

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
    const {control, handleSubmit, watch, setValue, formState: {errors}} = useForm();
    const {setLoading: setToastLoading} = useToastContext();

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
              formData
              , setToastLoading, `employee/private/${user.id}`, true, "Uploading...", null, "PUT");
        if (res.status === 200) {
            setUser((prev) => ({...prev, ...res.data}))
            handleCloseImageModal();
        }
    };

    if (loading) return <CircularProgress/>;

    return (
          <Container>
              <Typography variant="h4" gutterBottom className={"text-secondary"}>Employee Profile</Typography>
              <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                      <Box display="flex" flexDirection="column" height="100%">
                          <ProfileSection>
                              <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                                  <Avatar src={user.photo} alt="User Photo" sx={{width: 100, height: 100, mb: 2}}/>
                                  <IconButton onClick={() => handleImageEditClick('photo')}><IoMdCreate/></IconButton>
                                  <Box display="flex" alignItems="center" mb={1}>
                                      <Typography variant="body1" sx={{mr: 1}}>Name: {user.name}</Typography>
                                      <IconButton onClick={() => handleEditClick('name')}><IoMdCreate/></IconButton>
                                  </Box>
                                  <Box display="flex" alignItems="center" mb={1}>
                                      <Typography variant="body1" sx={{mr: 1}}>Email: {user.email}</Typography>
                                      <IconButton onClick={() => handleEditClick('email')}><IoMdCreate/></IconButton>
                                  </Box>
                                  <Box display="flex" alignItems="center" mb={1}>
                                      <Typography variant="body1" sx={{mr: 1}}>Phone: {user.phone}</Typography>
                                      <IconButton onClick={() => handleEditClick('phone')}><IoMdCreate/></IconButton>
                                  </Box>
                              </Box>
                          </ProfileSection>
                          <ProfileSection>
                              <Typography variant="h6">Personal Information</Typography>
                              <Divider sx={{my: 1}}/>
                              <Box display="flex" alignItems="center" mb={1}>
                                  <Typography variant="body1" sx={{mr: 1}}>Zone: {user.zone}</Typography>
                                  <IconButton onClick={() => handleEditClick('zone')}><IoMdCreate/></IconButton>
                              </Box>
                              <Box display="flex" alignItems="center" mb={1}>
                                  <Typography variant="body1" sx={{mr: 1}}>Gender: {user.gender}</Typography>
                                  <IconButton onClick={() => handleEditClick('gender')}><IoMdCreate/></IconButton>
                              </Box>
                              <Box display="flex" alignItems="center" mb={1}>
                                  <Typography variant="body1" sx={{mr: 1}}>Emirates ID: {user.emiratesId}</Typography>
                                  <IconButton onClick={() => handleEditClick('emiratesId')}><IoMdCreate/></IconButton>
                              </Box>
                              <Box display="flex" alignItems="center" mb={2}>
                                  <Typography variant="body1">Emirates ID Photo: </Typography>
                                  {user.emiratesIdPhoto?.endsWith('.pdf') ? (
                                        <>
                                            <Link href={user.emiratesIdPhoto} target="_blank" rel="noopener noreferrer"
                                                  sx={{ml: 1}}>View PDF</Link>
                                            <IconButton
                                                  onClick={() => handleImageEditClick('emiratesIdPhoto')}><IoMdCreate/></IconButton>
                                        </>
                                  ) : (
                                        <Box display="flex" alignItems="center" ml={1}>
                                            <Avatar src={user.emiratesIdPhoto} alt="Emirates ID Photo"
                                                    sx={{width: 80, height: 80, mr: 1}}/>
                                            <IconButton
                                                  onClick={() => handleImageEditClick('emiratesIdPhoto')}><IoMdCreate/></IconButton>
                                            <Tooltip title="View Full Image">
                                                <IconButton
                                                      onClick={() => setFullImageModal(user.emiratesIdPhoto)}><IoMdEye/></IconButton>
                                            </Tooltip>
                                        </Box>
                                  )}
                              </Box>
                          </ProfileSection>
                      </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                      <Box display="flex" flexDirection="column" height="100%">
                          <ProfileSection>
                              <Typography variant="h6">Bank Information</Typography>
                              <Divider sx={{my: 1}}/>
                              <Box display="flex" alignItems="center" mb={1}>
                                  <Typography variant="body1" sx={{mr: 1}}>Bank Name: {user.bankName}</Typography>
                                  <IconButton onClick={() => handleEditClick('bankName')}><IoMdCreate/></IconButton>
                              </Box>
                              <Box display="flex" alignItems="center" mb={1}>
                                  <Typography variant="body1" sx={{mr: 1}}>Bank User
                                      Name: {user.bankUserName}</Typography>
                                  <IconButton onClick={() => handleEditClick('bankUserName')}><IoMdCreate/></IconButton>
                              </Box>
                              <Box display="flex" alignItems="center" mb={1}>
                                  <Typography variant="body1" sx={{mr: 1}}>IBAN: {user.ibanBank}</Typography>
                                  <IconButton onClick={() => handleEditClick('ibanBank')}><IoMdCreate/></IconButton>
                              </Box>
                              <Box display="flex" alignItems="center" mb={2}>
                                  <Typography variant="body1">IBAN Bank Photo: </Typography>
                                  {user.ibanBankPhoto?.endsWith('.pdf') ? (
                                        <>
                                            <Link href={user.ibanBankPhoto} target="_blank" rel="noopener noreferrer"
                                                  sx={{ml: 1}}>View PDF</Link>
                                            <IconButton
                                                  onClick={() => handleImageEditClick('ibanBankPhoto')}><IoMdCreate/></IconButton>
                                        </>
                                  ) : (
                                        <Box display="flex" alignItems="center" ml={1}>
                                            <Avatar src={user.ibanBankPhoto} alt="IBAN Bank Photo"
                                                    sx={{width: 80, height: 80, mr: 1}}/>
                                            <IconButton
                                                  onClick={() => handleImageEditClick('ibanBankPhoto')}><IoMdCreate/></IconButton>
                                            <Tooltip title="View Full Image">
                                                <IconButton
                                                      onClick={() => setFullImageModal(user.ibanBankPhoto)}><IoMdEye/></IconButton>
                                            </Tooltip>
                                        </Box>
                                  )}
                              </Box>
                          </ProfileSection>
                          <ProfileSection>
                              <Typography variant="h6">Additional Information</Typography>
                              <Divider sx={{my: 1}}/>
                              <Box display="flex" alignItems="center" mb={1}>
                                  <Typography variant="body1" sx={{mr: 1}}>Passport
                                      Number: {user.passportNumber}</Typography>
                                  <IconButton
                                        onClick={() => handleEditClick('passportNumber')}><IoMdCreate/></IconButton>
                              </Box>
                              <Box display="flex" alignItems="center" mb={2}>
                                  <Typography variant="body1">Passport Photo: </Typography>
                                  {user.passportPhoto?.endsWith('.pdf') ? (
                                        <>
                                            <Link href={user.passportPhoto} target="_blank" rel="noopener noreferrer"
                                                  sx={{ml: 1}}>View PDF</Link>
                                            <IconButton
                                                  onClick={() => handleImageEditClick('passportPhoto')}><IoMdCreate/></IconButton>
                                        </>
                                  ) : (
                                        <Box display="flex" alignItems="center" ml={1}>
                                            <Avatar src={user.passportPhoto} alt="Passport Photo"
                                                    sx={{width: 80, height: 80, mr: 1}}/>
                                            <IconButton
                                                  onClick={() => handleImageEditClick('passportPhoto')}><IoMdCreate/></IconButton>
                                            <Tooltip title="View Full Image">
                                                <IconButton
                                                      onClick={() => setFullImageModal(user.passportPhoto)}><IoMdEye/></IconButton>
                                            </Tooltip>
                                        </Box>
                                  )}
                              </Box>
                              <Box display="flex" alignItems="center" mb={1}>
                                  <Typography variant="body1" sx={{mr: 1}}>Graduation
                                      Name: {user.graduationName}</Typography>
                                  <IconButton
                                        onClick={() => handleEditClick('graduationName')}><IoMdCreate/></IconButton>
                              </Box>
                              <Box display="flex" alignItems="center" mb={2}>
                                  <Typography variant="body1">Graduation Image: </Typography>
                                  {user.graduationImage?.endsWith('.pdf') ? (
                                        <>
                                            <Link href={user.graduationImage} target="_blank" rel="noopener noreferrer"
                                                  sx={{ml: 1}}>View PDF</Link>
                                            <IconButton
                                                  onClick={() => handleImageEditClick('graduationImage')}><IoMdCreate/></IconButton>
                                        </>
                                  ) : (
                                        <Box display="flex" alignItems="center" ml={1}>
                                            <Avatar src={user.graduationImage} alt="Graduation Image"
                                                    sx={{width: 80, height: 80, mr: 1}}/>
                                            <IconButton
                                                  onClick={() => handleImageEditClick('graduationImage')}><IoMdCreate/></IconButton>
                                            <Tooltip title="View Full Image">
                                                <IconButton
                                                      onClick={() => setFullImageModal(user.graduationImage)}><IoMdEye/></IconButton>
                                            </Tooltip>
                                        </Box>
                                  )}
                              </Box>
                          </ProfileSection>
                      </Box>
                  </Grid>
              </Grid>

              {/* Modal for editing details */}
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

              {/* Modal for editing images */}
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

              {/* Full Image Modal */}
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

export default ProfilePage;
