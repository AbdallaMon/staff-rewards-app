import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
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
    Grid
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { handleRequestSubmit } from "@/helpers/functions/handleSubmit";
import { useToastContext } from "@/providers/ToastLoadingProvider";

// Dummy API fetch functions (replace with your actual API calls)
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

const Input = styled('input')({
    display: 'none',
});

const MultiStepForm = () => {
    const [activeStep, setActiveStep] = useState(0);
    const { handleSubmit, control, watch, formState: { errors }, trigger, setValue } = useForm();
    const [dutyOptions, setDutyOptions] = useState([]);
    const [centerOptions, setCenterOptions] = useState([]);
    const [loadingDuties, setLoadingDuties] = useState(true);
    const [loadingCenters, setLoadingCenters] = useState(true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { setLoading } = useToastContext();
const [submit,setSubmit]=useState(false)
    const [fileInputs, setFileInputs] = useState({
        emiratesIdPhoto: null,
        ibanBankPhoto: null,
        graduationImage: null,
        passportPhoto: null,
        photo: null,
    });

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
        'Document Uploads',
        'Review & Submit'
    ];

    const stepFieldGroups = [
        ['name', 'emiratesId', 'email', 'zone', 'gender', 'phone', 'emiratesIdPhoto'],
        ['dutyId', 'centerId'],
        ['bankName', 'bankUserName', 'ibanBank', 'ibanBankPhoto'],
        ['graduationName', 'graduationImage', 'passportNumber', 'passportPhoto', 'photo']
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
        return
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const onSubmit = async (data) => {
        if(submit){

        const formData = new FormData();
        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });
        Object.keys(fileInputs).forEach(key => {
            if (fileInputs[key]) {
                formData.append(key, fileInputs[key]);
            }
        });
        await handleRequestSubmit(formData, setLoading, "/api/staff/public", true, "Sending...", false, "POST");

        }else{
            setSubmit(true)
        }
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
            setFileInputs({
                ...fileInputs,
                [field]: file
            });
            setValue(field, file);
        } else {
            alert('Only image or PDF files are allowed');
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
                      <Grid item xs={12}>
                          <Typography variant="body1" fontWeight="bold">Email</Typography>
                          <Typography variant="body2">{data.email}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Zone</Typography>
                          <Typography variant="body2">{data.zone}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Gender</Typography>
                          <Typography variant="body2">{data.gender}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Phone</Typography>
                          <Typography variant="body2">{data.phone}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Emirates ID Photo</Typography>
                          {fileInputs.emiratesIdPhoto && (
                                fileInputs.emiratesIdPhoto.type === 'application/pdf' ?
                                      <Typography variant="body2">{fileInputs.emiratesIdPhoto.name}</Typography> :
                                      <img src={URL.createObjectURL(fileInputs.emiratesIdPhoto)} alt="Emirates ID" width="100" />
                          )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Duty</Typography>
                          <Typography variant="body2">{dutyOptions.find(option => option.id === data.dutyId)?.name || ''}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Center</Typography>
                          <Typography variant="body2">{centerOptions.find(option => option.id === data.centerId)?.name || ''}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Bank Name</Typography>
                          <Typography variant="body2">{data.bankName}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Bank User Name</Typography>
                          <Typography variant="body2">{data.bankUserName}</Typography>
                      </Grid>
                      <Grid item xs={12}>
                          <Typography variant="body1" fontWeight="bold">IBAN</Typography>
                          <Typography variant="body2">{data.ibanBank}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <Typography variant="body1" fontWeight="bold">IBAN Bank Photo</Typography>
                          {fileInputs.ibanBankPhoto && (
                                fileInputs.ibanBankPhoto.type === 'application/pdf' ?
                                      <Typography variant="body2">{fileInputs.ibanBankPhoto.name}</Typography> :
                                      <img src={URL.createObjectURL(fileInputs.ibanBankPhoto)} alt="IBAN Bank" width="100" />
                          )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Graduation Name</Typography>
                          <Typography variant="body2">{data.graduationName}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Graduation Image</Typography>
                          {fileInputs.graduationImage && (
                                fileInputs.graduationImage.type === 'application/pdf' ?
                                      <Typography variant="body2">{fileInputs.graduationImage.name}</Typography> :
                                      <img src={URL.createObjectURL(fileInputs.graduationImage)} alt="Graduation" width="100" />
                          )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Passport Number</Typography>
                          <Typography variant="body2">{data.passportNumber}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Passport Photo</Typography>
                          {fileInputs.passportPhoto && (
                                fileInputs.passportPhoto.type === 'application/pdf' ?
                                      <Typography variant="body2">{fileInputs.passportPhoto.name}</Typography> :
                                      <img src={URL.createObjectURL(fileInputs.passportPhoto)} alt="Passport" width="100" />
                          )}
                      </Grid>
                      <Grid item xs={12} sm={6}>
                          <Typography variant="body1" fontWeight="bold">Photo</Typography>
                          {fileInputs.photo && (
                                fileInputs.photo.type === 'application/pdf' ?
                                      <Typography variant="body2">{fileInputs.photo.name}</Typography> :
                                      <img src={URL.createObjectURL(fileInputs.photo)} alt="Personal" width="100" />
                          )}
                      </Grid>
                  </Grid>
              </Box>
        );
    };

    return (
          <Container maxWidth="sm" sx={{ bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: 3, marginX: 'auto' }}>
              <Typography variant="h4" gutterBottom textAlign="center">Employee Registration</Typography>
              <Stepper activeStep={activeStep} alternativeLabel sx={{ overflowX: 'auto' }}>
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
                                  rules={{ required: 'Name is required' }}
                                  render={({ field }) => (
                                        <TextField
                                              {...field}
                                              label="Name"
                                              fullWidth
                                              margin="normal"
                                              error={!!errors.name}
                                              helperText={errors.name ? errors.name.message : ''}
                                              sx={{ bgcolor: 'background.default' }}
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
                                  render={({ field }) => (
                                        <TextField
                                              {...field}
                                              label="Emirates ID"
                                              fullWidth
                                              margin="normal"
                                              error={!!errors.emiratesId}
                                              helperText={errors.emiratesId ? errors.emiratesId.message : 'Enter 15 digits'}
                                              sx={{ bgcolor: 'background.default' }}
                                        />
                                  )}
                            />
                            <Controller
                                  name="email"
                                  control={control}
                                  rules={{ required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } }}
                                  render={({ field }) => (
                                        <TextField
                                              {...field}
                                              label="Email"
                                              fullWidth
                                              margin="normal"
                                              error={!!errors.email}
                                              helperText={errors.email ? errors.email.message : ''}
                                              sx={{ bgcolor: 'background.default' }}
                                        />
                                  )}
                            />
                            <Controller
                                  name="emiratesIdPhoto"
                                  control={control}
                                  rules={{ required: 'Emirates ID Photo is required' }}
                                  render={({ field }) => (
                                        <FormControl fullWidth margin="normal">
                                            <label htmlFor="emiratesIdPhoto">
                                                <Input
                                                      id="emiratesIdPhoto"
                                                      type="file"
                                                      accept="image/*,application/pdf"
                                                      onChange={(e) => handleFileChange(e, 'emiratesIdPhoto')}
                                                />
                                                <Button variant="contained" component="span" color="primary">
                                                    Upload Emirates ID Photo
                                                </Button>
                                            </label>
                                            {errors.emiratesIdPhoto && <Typography color="error">{errors.emiratesIdPhoto.message}</Typography>}
                                            {fileInputs.emiratesIdPhoto && (
                                                  <Box mt={2}>
                                                      {fileInputs.emiratesIdPhoto.type === 'application/pdf' ? (
                                                            <Typography variant="body2">{fileInputs.emiratesIdPhoto.name}</Typography>
                                                      ) : (
                                                            <img src={URL.createObjectURL(fileInputs.emiratesIdPhoto)} alt="Emirates ID" width="100" />
                                                      )}
                                                  </Box>
                                            )}
                                        </FormControl>
                                  )}
                            />
                            <Controller
                                  name="zone"
                                  control={control}
                                  rules={{ required: 'Zone is required' }}
                                  render={({ field }) => (
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel>Zone</InputLabel>
                                            <Select {...field} label="Zone" error={!!errors.zone} sx={{ bgcolor: 'background.default' }}>
                                                {zones.map((zone, index) => (
                                                      <MenuItem key={index} value={zone}>{zone}</MenuItem>
                                                ))}
                                            </Select>
                                            {errors.zone && <Typography color="error">{errors.zone.message}</Typography>}
                                        </FormControl>
                                  )}
                            />
                            <Controller
                                  name="gender"
                                  control={control}
                                  rules={{ required: 'Gender is required' }}
                                  render={({ field }) => (
                                        <FormControl fullWidth margin="normal">
                                            <InputLabel>Gender</InputLabel>
                                            <Select {...field} label="Gender" error={!!errors.gender} sx={{ bgcolor: 'background.default' }}>
                                                {genders.map((gender, index) => (
                                                      <MenuItem key={index} value={gender}>{gender}</MenuItem>
                                                ))}
                                            </Select>
                                            {errors.gender && <Typography color="error">{errors.gender.message}</Typography>}
                                        </FormControl>
                                  )}
                            />
                            <Controller
                                  name="phone"
                                  control={control}
                                  rules={{ required: 'Phone is required' }}
                                  render={({ field }) => (
                                        <TextField
                                              {...field}
                                              label="Phone"
                                              fullWidth
                                              margin="normal"
                                              error={!!errors.phone}
                                              helperText={errors.phone ? errors.phone.message : ''}
                                              sx={{ bgcolor: 'background.default' }}
                                        />
                                  )}
                            />
                        </Box>
                  )}
                  {activeStep === 1 && (
                        <Box>
                            {loadingDuties ? (
                                  <Box display="flex" justifyContent="center" my={2}>
                                      <CircularProgress />
                                  </Box>
                            ) : (
                                  <Controller
                                        name="dutyId"
                                        control={control}
                                        rules={{ required: 'Duty is required' }}
                                        render={({ field }) => (
                                              <FormControl fullWidth margin="normal">
                                                  <InputLabel>Duty</InputLabel>
                                                  <Select {...field} label="Duty" error={!!errors.dutyId} sx={{ bgcolor: 'background.default' }}>
                                                      {dutyOptions.map((duty) => (
                                                            <MenuItem key={duty.id} value={duty.id}>{duty.name}</MenuItem>
                                                      ))}
                                                  </Select>
                                                  {errors.dutyId && <Typography color="error">{errors.dutyId.message}</Typography>}
                                              </FormControl>
                                        )}
                                  />
                            )}
                            {loadingCenters ? (
                                  <Box display="flex" justifyContent="center" my={2}>
                                      <CircularProgress />
                                  </Box>
                            ) : (
                                  <Controller
                                        name="centerId"
                                        control={control}
                                        rules={{ required: 'Center is required' }}
                                        render={({ field }) => (
                                              <FormControl fullWidth margin="normal">
                                                  <InputLabel>Center</InputLabel>
                                                  <Select {...field} label="Center" error={!!errors.centerId} sx={{ bgcolor: 'background.default' }}>
                                                      {centerOptions.map((center) => (
                                                            <MenuItem key={center.id} value={center.id}>{center.name}</MenuItem>
                                                      ))}
                                                  </Select>
                                                  {errors.centerId && <Typography color="error">{errors.centerId.message}</Typography>}
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
                                  rules={{ required: 'Bank Name is required' }}
                                  render={({ field }) => (
                                        <TextField
                                              {...field}
                                              label="Bank Name"
                                              fullWidth
                                              margin="normal"
                                              error={!!errors.bankName}
                                              helperText={errors.bankName ? errors.bankName.message : ''}
                                              sx={{ bgcolor: 'background.default' }}
                                        />
                                  )}
                            />
                            <Controller
                                  name="bankUserName"
                                  control={control}
                                  rules={{ required: 'Bank User Name is required' }}
                                  render={({ field }) => (
                                        <TextField
                                              {...field}
                                              label="Bank User Name"
                                              fullWidth
                                              margin="normal"
                                              error={!!errors.bankUserName}
                                              helperText={errors.bankUserName ? errors.bankUserName.message : ''}
                                              sx={{ bgcolor: 'background.default' }}
                                        />
                                  )}
                            />
                            <Controller
                                  name="ibanBank"
                                  control={control}
                                  rules={{
                                      required: 'IBAN is required',
                                      pattern: {
                                          value: /^AE\d{2}\d{3}\d{16}$/,
                                          message: 'Invalid IBAN format, it should be 23 characters in the UAE format: AE followed by 21 digits'

                                      }
                                  }}
                                  render={({ field }) => (
                                        <TextField
                                              {...field}
                                              label="IBAN"
                                              fullWidth
                                              margin="normal"
                                              error={!!errors.ibanBank}
                                              helperText={errors.ibanBank ? errors.ibanBank.message : 'Enter the UAE IBAN format: AE followed by 21 digits'}
                                              sx={{ bgcolor: 'background.default' }}
                                        />
                                  )}
                            />
                            <Controller
                                  name="ibanBankPhoto"
                                  control={control}
                                  rules={{ required: 'IBAN Bank Photo is required' }}
                                  render={({ field }) => (
                                        <FormControl fullWidth margin="normal">
                                            <label htmlFor="ibanBankPhoto">
                                                <Input
                                                      id="ibanBankPhoto"
                                                      type="file"
                                                      accept="image/*,application/pdf"
                                                      onChange={(e) => handleFileChange(e, 'ibanBankPhoto')}
                                                />
                                                <Button variant="contained" component="span" color="primary">
                                                    Upload IBAN Bank Photo
                                                </Button>
                                            </label>
                                            {errors.ibanBankPhoto && <Typography color="error">{errors.ibanBankPhoto.message}</Typography>}
                                            {fileInputs.ibanBankPhoto && (
                                                  <Box mt={2}>
                                                      {fileInputs.ibanBankPhoto.type === 'application/pdf' ? (
                                                            <Typography variant="body2">{fileInputs.ibanBankPhoto.name}</Typography>
                                                      ) : (
                                                            <img src={URL.createObjectURL(fileInputs.ibanBankPhoto)} alt="IBAN Bank" width="100" />
                                                      )}
                                                  </Box>
                                            )}
                                        </FormControl>
                                  )}
                            />
                        </Box>
                  )}
                  {activeStep === 3 && (
                        <Box>
                            <Controller
                                  name="graduationName"
                                  control={control}
                                  rules={{ required: 'Graduation Name is required' }}
                                  render={({ field }) => (
                                        <TextField
                                              {...field}
                                              label="Graduation Name"
                                              fullWidth
                                              margin="normal"
                                              error={!!errors.graduationName}
                                              helperText={errors.graduationName ? errors.graduationName.message : ''}
                                              sx={{ bgcolor: 'background.default' }}
                                        />
                                  )}
                            />
                            <Controller
                                  name="graduationImage"
                                  control={control}
                                  rules={{ required: 'Graduation Image is required' }}
                                  render={({ field }) => (
                                        <FormControl fullWidth margin="normal">
                                            <label htmlFor="graduationImage">
                                                <Input
                                                      id="graduationImage"
                                                      type="file"
                                                      accept="image/*,application/pdf"
                                                      onChange={(e) => handleFileChange(e, 'graduationImage')}
                                                />
                                                <Button variant="contained" component="span" color="primary">
                                                    Upload Graduation Image
                                                </Button>
                                            </label>
                                            {errors.graduationImage && <Typography color="error">{errors.graduationImage.message}</Typography>}
                                            {fileInputs.graduationImage && (
                                                  <Box mt={2}>
                                                      {fileInputs.graduationImage.type === 'application/pdf' ? (
                                                            <Typography variant="body2">{fileInputs.graduationImage.name}</Typography>
                                                      ) : (
                                                            <img src={URL.createObjectURL(fileInputs.graduationImage)} alt="Graduation" width="100" />
                                                      )}
                                                  </Box>
                                            )}
                                        </FormControl>
                                  )}
                            />
                            <Controller
                                  name="passportNumber"
                                  control={control}
                                  rules={{
                                      required: 'Passport Number is required',
                                      pattern: {
                                          value: /^\d{9}$/,
                                          message: 'Invalid Passport Number format, it should be 9 digits'
                                      }
                                  }}
                                  render={({ field }) => (
                                        <TextField
                                              {...field}
                                              label="Passport Number"
                                              fullWidth
                                              margin="normal"
                                              error={!!errors.passportNumber}
                                              helperText={errors.passportNumber ? errors.passportNumber.message : 'Enter 9 digits'}
                                              sx={{ bgcolor: 'background.default' }}
                                        />
                                  )}
                            />
                            <Controller
                                  name="passportPhoto"
                                  control={control}
                                  rules={{ required: 'Passport Photo is required' }}
                                  render={({ field }) => (
                                        <FormControl fullWidth margin="normal">
                                            <label htmlFor="passportPhoto">
                                                <Input
                                                      id="passportPhoto"
                                                      type="file"
                                                      accept="image/*,application/pdf"
                                                      onChange={(e) => handleFileChange(e, 'passportPhoto')}
                                                />
                                                <Button variant="contained" component="span" color="primary">
                                                    Upload Passport Photo
                                                </Button>
                                            </label>
                                            {errors.passportPhoto && <Typography color="error">{errors.passportPhoto.message}</Typography>}
                                            {fileInputs.passportPhoto && (
                                                  <Box mt={2}>
                                                      {fileInputs.passportPhoto.type === 'application/pdf' ? (
                                                            <Typography variant="body2">{fileInputs.passportPhoto.name}</Typography>
                                                      ) : (
                                                            <img src={URL.createObjectURL(fileInputs.passportPhoto)} alt="Passport" width="100" />
                                                      )}
                                                  </Box>
                                            )}
                                        </FormControl>
                                  )}
                            />
                            <Controller
                                  name="photo"
                                  control={control}
                                  rules={{ required: 'Photo is required' }}
                                  render={({ field }) => (
                                        <FormControl fullWidth margin="normal">
                                            <label htmlFor="photo">
                                                <Input
                                                      id="photo"
                                                      type="file"
                                                      accept="image/*,application/pdf"
                                                      onChange={(e) => handleFileChange(e, 'photo')}
                                                />
                                                <Button variant="contained" component="span" color="primary">
                                                    Upload Photo
                                                </Button>
                                            </label>
                                            {errors.photo && <Typography color="error">{errors.photo.message}</Typography>}
                                            {fileInputs.photo && (
                                                  <Box mt={2}>
                                                      {fileInputs.photo.type === 'application/pdf' ? (
                                                            <Typography variant="body2">{fileInputs.photo.name}</Typography>
                                                      ) : (
                                                            <img src={URL.createObjectURL(fileInputs.photo)} alt="Personal" width="100" />
                                                      )}
                                                  </Box>
                                            )}
                                        </FormControl>
                                  )}
                            />
                        </Box>
                  )}
                  {activeStep === 4 && (
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
                      {activeStep === steps.length -1 ? (
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
          </Container>
    );
};

export default MultiStepForm;
