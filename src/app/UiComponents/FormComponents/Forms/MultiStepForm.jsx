import React, {useState, useEffect} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {
    TextField,
    Button,
    MenuItem,
    Stepper,
    Step,
    StepLabel,
    Container,
    Box,
    Typography,
    Select,
    InputLabel,
    FormControl,
    CircularProgress,
    useMediaQuery,
    Grid, InputAdornment
} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";

const fetchOptions = async (id) => {
    const response = await fetch(`/api/index?id=${id}`);
    const result = await response.json();
    return result.data;  // Assuming the API returns data in this format
};

const zones = [
    'ABU_DHABI',
    'AJMAN',
    'DUBAI',
    'FUJAIRAH',
    'RAS_AL_KHAIMAH',
    'SHARJAH',
    'UMM_AL_QUWAIN'
];

const genders = ['MALE', 'FEMALE'];

const MultiStepForm = () => {
    const [activeStep, setActiveStep] = useState(0);
    const {handleSubmit, control, watch, formState: {errors}, trigger} = useForm();
    const [dutyOptions, setDutyOptions] = useState([]);
    const [centerOptions, setCenterOptions] = useState([]);
    const [loadingDuties, setLoadingDuties] = useState(true);
    const [loadingCenters, setLoadingCenters] = useState(true);
    const theme = useTheme();
    const [isSubmitted, setIsSubmitted] = useState(false);
    const {setLoading} = useToastContext();
    const [submit, setSubmit] = useState(false);

    useEffect(() => {
        const loadDuties = async () => {
            const duties = await fetchOptions('duty');
            setDutyOptions(duties);
            setLoadingDuties(false);
        };

        const loadCenters = async () => {
            const centers = await fetchOptions('center');
            setCenterOptions(centers);
            setLoadingCenters(false);
        };

        loadDuties();
        loadCenters();
    }, []);

    const steps = [
        'Personal Information',
        'Employment Information',
        'Bank Details',
        'Review & Submit'
    ];

    const stepFieldGroups = [
        ['name', 'emiratesId', 'email', 'zone', 'gender', 'graduationName', 'phone'],
        ['dutyId', 'centerId'],
        ['bankName', 'bankUserName', 'ibanBank']
    ];

    const isStepValid = async () => {
        const stepFields = stepFieldGroups[activeStep];
        const result = await trigger(stepFields);
        return result;
    };

    const handleNext = async () => {
        if (await isStepValid()) {
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        }
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const onSubmit = async (data) => {
        if (submit) {
            const res = await handleRequestSubmit(data, setLoading, "employee/public/register", false, "Sending...", false, "POST");
            if (res.status === 200) {
                setIsSubmitted(true)
            }
        } else {
            setSubmit(true);
        }
    };

    const renderReview = (data) => {
        return (
              <Box>
                  <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Name</Typography>
                          <Typography variant="body2">{data.name}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Emirates ID</Typography>
                          <Typography variant="body2">{data.emiratesId}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Email</Typography>
                          <Typography variant="body2">{data.email}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Education</Typography>
                          <Typography variant="body2">{data.graduationName}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Zone</Typography>
                          <Typography variant="body2">{data.zone}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Gender</Typography>
                          <Typography variant="body2">{data.gender}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Phone</Typography>
                          <Typography variant="body2">{data.phone}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Duty</Typography>
                          <Typography
                                variant="body2">{dutyOptions.find(option => option.id === data.dutyId)?.name || ''}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Center</Typography>
                          <Typography
                                variant="body2">{centerOptions.find(option => option.id === data.centerId)?.name || ''}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Bank Name</Typography>
                          <Typography variant="body2">{data.bankName}</Typography>
                      </Grid>
                      <Grid item xs={6} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Bank User Name</Typography>
                          <Typography variant="body2">{data.bankUserName}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                          <Typography variant="body1" fontWeight="bold">IBAN</Typography>
                          <Typography variant="body2">{data.ibanBank}</Typography>
                      </Grid>
                  </Grid>
              </Box>
        );
    };

    return (
          <Container maxWidth="sm"
                     sx={{bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: 3, marginX: 'auto'}}>
              {isSubmitted ? (
                    <>
                        <Typography variant="h6" color="success.main" textAlign="center" gutterBottom>
                            Your form has been successfully submitted!
                        </Typography>
                        <Typography variant="body1" color="success.dark" textAlign="center" gutterBottom>
                            A confirmation link has been sent to your email please follow the url to confirm your
                            account
                        </Typography>
                    </>
              ) : (
                    <>
                        <Typography variant="h4" gutterBottom textAlign="center">Employee Registration</Typography>

                        <Stepper activeStep={activeStep} alternativeLabel sx={{overflowX: 'auto'}}>
                            {steps.map((label) => (
                                  <Step key={label}>
                                      <StepLabel>{label}</StepLabel>
                                  </Step>
                            ))}
                        </Stepper>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            {activeStep === 0 && (
                                  <Box>
                                      <Controller
                                            name="name"
                                            control={control}
                                            rules={{
                                                required: 'Name is required',
                                                pattern: {
                                                    value: /^[a-zA-Z]+ [a-zA-Z]+ [a-zA-Z]+$/,
                                                    message: 'Please enter at least three names'
                                                }
                                            }}
                                            render={({field}) => (
                                                  <TextField
                                                        {...field}
                                                        label="Name"
                                                        fullWidth
                                                        margin="normal"
                                                        error={!!errors.name}
                                                        helperText={errors.name ? errors.name.message : 'Your full name (at least three)'}
                                                        sx={{bgcolor: 'background.default'}}
                                                  />
                                            )}
                                      />
                                      <Controller
                                            name="emiratesId"
                                            control={control}
                                            rules={{
                                                required: 'Emirates ID is required',
                                                pattern: {
                                                    value: /^\d{15}$/,
                                                    message: 'Invalid Emirates ID format, it should be 15 digits'
                                                }
                                            }}
                                            render={({field}) => (
                                                  <TextField
                                                        {...field}
                                                        label="Emirates ID"
                                                        fullWidth
                                                        type={"number"}
                                                        margin="normal"
                                                        error={!!errors.emiratesId}
                                                        helperText={errors.emiratesId && errors.emiratesId.message}
                                                        sx={{bgcolor: 'background.default'}}
                                                        value={field.value}
                                                        onChange={(e) => {
                                                            if (e.target.value.length === 16) return;
                                                            return field.onChange(e.target.value)
                                                        }}
                                                  />
                                            )}
                                      />
                                      <Controller
                                            name="passportNumber"
                                            control={control}
                                            rules={{
                                                required: 'Passport Number is required',
                                            }}
                                            render={({field}) => (
                                                  <TextField
                                                        {...field}
                                                        label="Passport Number"
                                                        fullWidth
                                                        margin="normal"
                                                        error={!!errors.passportNumber}
                                                        helperText={errors.passportNumber ? errors.passportNumber.message : 'Passport number is required'}
                                                        sx={{bgcolor: 'background.default'}}
                                                        value={field.value}
                                                  />
                                            )}
                                      />
                                      <Controller
                                            name="email"
                                            control={control}
                                            rules={{
                                                required: 'Email is required',
                                                pattern: {
                                                    value: /^(?!.*\.(gov|ae)$)\S+@\S+\.\S+$/i,
                                                    message: 'Invalid email address note: .gov/.ae  are not accepted'
                                                }
                                            }}
                                            render={({field}) => (
                                                  <TextField
                                                        {...field}
                                                        label="Email"
                                                        fullWidth
                                                        margin="normal"
                                                        error={!!errors.email}
                                                        helperText={errors.email ? errors.email.message : "Your personal account"}
                                                        sx={{bgcolor: 'background.default'}}
                                                  />
                                            )}
                                      />
                                      <Controller
                                            name="zone"
                                            control={control}
                                            rules={{required: 'Zone is required'}}
                                            render={({field}) => (
                                                  <FormControl fullWidth margin="normal">
                                                      <InputLabel>Zone</InputLabel>
                                                      <Select {...field} label="Zone" error={!!errors.zone}
                                                              sx={{bgcolor: 'background.default'}}>
                                                          {zones.map((zone, index) => (
                                                                <MenuItem key={index} value={zone}>{zone}</MenuItem>
                                                          ))}
                                                      </Select>
                                                      {errors.zone &&
                                                            <Typography
                                                                  color="error">{errors.zone.message}</Typography>}
                                                  </FormControl>
                                            )}
                                      />
                                      <Controller
                                            name="gender"
                                            control={control}
                                            rules={{required: 'Gender is required'}}
                                            render={({field}) => (
                                                  <FormControl fullWidth margin="normal">
                                                      <InputLabel>Gender</InputLabel>
                                                      <Select {...field} label="Gender" error={!!errors.gender}
                                                              sx={{bgcolor: 'background.default'}}>
                                                          {genders.map((gender, index) => (
                                                                <MenuItem key={index} value={gender}>{gender}</MenuItem>
                                                          ))}
                                                      </Select>
                                                      {errors.gender &&
                                                            <Typography
                                                                  color="error">{errors.gender.message}</Typography>}
                                                  </FormControl>
                                            )}
                                      />
                                      <Controller
                                            name="graduationName"
                                            control={control}
                                            rules={{required: 'Education  is required'}}
                                            render={({field}) => (
                                                  <TextField
                                                        {...field}
                                                        label="Education"
                                                        fullWidth
                                                        margin="normal"
                                                        error={!!errors.graduationName}
                                                        helperText={errors.graduationName ? errors.graduationName.message : ''}
                                                        sx={{bgcolor: 'background.default'}}
                                                  />
                                            )}
                                      />
                                      <Controller
                                            name="phone"
                                            control={control}
                                            rules={{required: 'Phone is required'}}
                                            render={({field}) => (
                                                  <TextField
                                                        {...field}
                                                        label="Phone"
                                                        fullWidth
                                                        margin="normal"
                                                        type="number"
                                                        error={!!errors.phone}
                                                        helperText={errors.phone ? errors.phone.message : ''}
                                                        sx={{bgcolor: 'background.default'}}
                                                  />
                                            )}
                                      />
                                  </Box>
                            )}
                            {activeStep === 1 && (
                                  <Box>
                                      {loadingDuties ? (
                                            <Box display="flex" justifyContent="center" my={2}>
                                                <CircularProgress/>
                                            </Box>
                                      ) : (
                                            <Controller
                                                  name="dutyId"
                                                  control={control}
                                                  rules={{required: 'Duty is required'}}
                                                  render={({field}) => (
                                                        <FormControl fullWidth margin="normal">
                                                            <InputLabel>Duty</InputLabel>
                                                            <Select {...field} label="Duty" error={!!errors.dutyId}
                                                                    sx={{bgcolor: 'background.default'}}>
                                                                {dutyOptions.map((duty) => (
                                                                      <MenuItem key={duty.id}
                                                                                value={duty.id}>{duty.name}</MenuItem>
                                                                ))}
                                                            </Select>
                                                            {errors.dutyId &&
                                                                  <Typography
                                                                        color="error">{errors.dutyId.message}</Typography>}
                                                        </FormControl>
                                                  )}
                                            />
                                      )}
                                      {loadingCenters ? (
                                            <Box display="flex" justifyContent="center" my={2}>
                                                <CircularProgress/>
                                            </Box>
                                      ) : (
                                            <Controller
                                                  name="centerId"
                                                  control={control}
                                                  rules={{required: 'Center is required'}}
                                                  render={({field}) => (
                                                        <FormControl fullWidth margin="normal">
                                                            <InputLabel>Center</InputLabel>
                                                            <Select {...field} label="Center" error={!!errors.centerId}
                                                                    sx={{bgcolor: 'background.default'}}>
                                                                {centerOptions.map((center) => (
                                                                      <MenuItem key={center.id}
                                                                                value={center.id}>{center.name}</MenuItem>
                                                                ))}
                                                            </Select>
                                                            {errors.centerId && <Typography
                                                                  color="error">{errors.centerId.message}</Typography>}
                                                        </FormControl>
                                                  )}
                                            />
                                      )}
                                  </Box>
                            )}
                            {activeStep === 2 && (
                                  <Box>
                                      <Controller
                                            name="bankName"
                                            control={control}
                                            rules={{required: 'Bank Name is required'}}
                                            render={({field}) => (
                                                  <TextField
                                                        {...field}
                                                        label="Bank Name"
                                                        fullWidth
                                                        margin="normal"
                                                        error={!!errors.bankName}
                                                        helperText={errors.bankName ? errors.bankName.message : 'Mashreq ,ADIB ,...'}
                                                        sx={{bgcolor: 'background.default'}}
                                                  />
                                            )}
                                      />
                                      <Controller
                                            name="bankUserName"
                                            control={control}
                                            rules={{required: 'Bank User Name is required'}}
                                            render={({field}) => (
                                                  <TextField
                                                        {...field}
                                                        label="Bank User Name"
                                                        fullWidth
                                                        margin="normal"
                                                        error={!!errors.bankUserName}
                                                        helperText={errors.bankUserName ? errors.bankUserName.message : 'Your full name in the bank'}
                                                        sx={{bgcolor: 'background.default'}}
                                                  />
                                            )}
                                      />
                                      <Controller
                                            name="ibanBank"
                                            control={control}
                                            // defaultValue="AE"
                                            rules={{
                                                required: 'IBAN is required',
                                                pattern: {
                                                    value: /^\d{21}$/,
                                                    message: 'Invalid IBAN format, it should be  21 digits'
                                                }
                                            }}
                                            render={({field}) => (
                                                  <TextField
                                                        {...field}
                                                        label="IBAN"
                                                        fullWidth
                                                        margin="normal"
                                                        type={"number"}
                                                        error={!!errors.ibanBank}
                                                        helperText={errors.ibanBank ? errors.ibanBank.message : 'Enter IBAN in the format: 21 digits'}
                                                        sx={{bgcolor: 'background.default'}}
                                                        InputProps={{
                                                            startAdornment: <InputAdornment
                                                                  position="start">AE</InputAdornment>,
                                                        }}
                                                        value={field.value}
                                                        onChange={(e) => {
                                                            if (e.target.value.length === 22) return;
                                                            return field.onChange(e.target.value)
                                                        }}
                                                  />
                                            )}
                                      />
                                  </Box>
                            )}
                            {activeStep === 3 && (
                                  <Box>
                                      <Typography variant="h6" gutterBottom>Review Your Information</Typography>
                                      {renderReview(watch())}
                                  </Box>
                            )}
                            <Box display="flex" justifyContent="space-between" mt={2}>
                                <Button
                                      variant="contained"
                                      color="primary"
                                      onClick={handleBack}
                                      disabled={activeStep === 0}
                                >
                                    Back
                                </Button>
                                {activeStep === steps.length - 1 ? (
                                      <Button
                                            variant="contained"
                                            color="primary"
                                            type="submit"
                                      >
                                          Submit
                                      </Button>
                                ) : (
                                      <Button
                                            variant="contained"
                                            color="primary"
                                            onClick={handleNext}
                                      >
                                          Next
                                      </Button>
                                )}
                            </Box>
                        </form>
                    </>
              )}
          </Container>
    );
};

export default MultiStepForm;
