"use client";
import React, {useState, useEffect} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {
    Button,
    FormControl,
    Box,
    Typography,
    Modal,
    Grid,
    Container,
    Select,
    MenuItem,
    InputLabel,
    TextField,
    CircularProgress,
    Tooltip,
    IconButton, InputAdornment,
} from '@mui/material';
import {styled} from '@mui/material/styles';
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";
import {IoMdClose} from "react-icons/io";
import {useSearchParams} from "next/navigation";
import jwt from 'jsonwebtoken';

const Input = styled('input')({
    display: 'none',
});

const fetchOptions = async (id) => {
    const response = await fetch(`/api/index?id=${id}`);
    const result = await response.json();
    return result.data; // Assuming the API returns data in this format
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

const UncompletedForm = () => {
    const {handleSubmit, control, setValue, formState: {errors}} = useForm();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const {setLoading} = useToastContext();
    const [fileInputs, setFileInputs] = useState({});
    const [validationErrors, setValidationErrors] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalImage, setModalImage] = useState(null);
    const [dutyOptions, setDutyOptions] = useState([]);
    const [centerOptions, setCenterOptions] = useState([]);
    const [loadingDuties, setLoadingDuties] = useState(true);
    const [loadingCenters, setLoadingCenters] = useState(true);
    const [incompleteFields, setIncompleteFields] = useState([]);
    const [decoding, setDecoding] = useState(true);

    useEffect(() => {
        const loadDuties = async () => {
            const duties = await fetchOptions('duty');
            if (!duties) {
                setDutyOptions([])
            }
            setDutyOptions(duties);
            setLoadingDuties(false);
        };

        const loadCenters = async () => {
            const centers = await fetchOptions('center');
            if (!centers) {
                setCenterOptions({})
            }
            setCenterOptions(centers);
            setLoadingCenters(false);
        };

        loadDuties();
        loadCenters();

        // Decode token and set incomplete fields
        const decodedToken = jwt.decode(token);

        decodedToken.checks.forEach((check) => {
            if (check.id.toLowerCase().includes("image") || check.id.toLowerCase().includes("photo")) {
                setFileInputs((old) => ({
                    ...old,
                    [check.id]: null
                }));
            }
        });
        setIncompleteFields(decodedToken.checks || []);

        setDecoding(false);
    }, [token]);
    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
            setFileInputs({
                ...fileInputs,
                [field]: file
            });
            setValue(field, file);
            setValidationErrors((prev) => ({
                ...prev,
                [field]: null
            }));
        } else {
            setFileInputs({
                ...fileInputs,
                [field]: null
            });
            setValidationErrors((prev) => ({
                ...prev,
                [field]: 'Only image or PDF files are allowed'
            }));
        }
    };

    const onSubmit = async (data) => {
        let hasError = false;
        const errors = {};
        // Validate each file input
        Object.keys(fileInputs).forEach((field) => {
            if (!fileInputs[field]) {
                errors[field] = `${field.replace(/([A-Z])/g, ' $1').trim()} is required`;
                hasError = true;
            }
        });

        if (hasError) {
            setValidationErrors(errors);
            return;
        }

        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key]) {
                formData.append(key, data[key]);
            }
        });

        await handleRequestSubmit(formData, setLoading, `employee/public/complete/${token}`, true, "Sending...", false, "POST");
    };

    const handleImageClick = (file) => {
        setModalImage(file);
        setModalOpen(true);
    };

    const renderInputField = (field, comment) => {
        switch (field.id) {
            case 'centerId':
                return (
                      <Controller
                            name={field.id}
                            control={control}
                            rules={{required: 'Center is required'}}
                            render={({field}) => (
                                  <FormControl fullWidth margin="normal">
                                      <InputLabel>Center</InputLabel>
                                      {loadingCenters ? (
                                            <CircularProgress size={24}/>
                                      ) : (
                                            <Select {...field} label="Center" error={!!errors.centerId}
                                                    sx={{bgcolor: 'background.default'}}>
                                                {centerOptions.map((center) => (
                                                      <MenuItem key={center.id}
                                                                value={center.id}>{center.name}</MenuItem>
                                                ))}
                                            </Select>
                                      )}
                                      {errors.centerId &&
                                            <Typography color="error">{errors.centerId.message}</Typography>}
                                      <Typography variant="body2" color="error">{comment}</Typography>
                                  </FormControl>
                            )}
                      />
                );
            case 'zone':
                return (
                      <Controller
                            name={field.id}
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
                                      {errors.zone && <Typography color="error">{errors.zone.message}</Typography>}
                                      <Typography variant="body2" color="error">{comment}</Typography>
                                  </FormControl>
                            )}
                      />
                );
            case 'dutyId':
                return (
                      <Controller
                            name={field.id}
                            control={control}
                            rules={{required: 'Duty is required'}}
                            render={({field}) => (
                                  <FormControl fullWidth margin="normal"
                                               helperText={"hi"}
                                  >
                                      <InputLabel>Duty</InputLabel>
                                      {loadingDuties ? (
                                            <CircularProgress size={24}/>
                                      ) : (
                                            <Select {...field} label="Duty" error={!!errors.dutyId}
                                                    sx={{bgcolor: 'background.default'}}>
                                                {dutyOptions.map((duty) => (
                                                      <MenuItem key={duty.id} value={duty.id}>{duty.name}</MenuItem>
                                                ))}
                                            </Select>
                                      )}
                                      {errors.dutyId && <Typography color="error">{errors.dutyId.message}</Typography>}
                                      <Typography variant="body2" color="error">{comment}</Typography>
                                  </FormControl>
                            )}
                      />
                );
            case 'emiratesIdPhoto':
            case 'ibanBankPhoto':
            case 'graduationImage':
            case 'passportPhoto':
            case 'photo':
                return (
                      <FormControl fullWidth margin="normal" key={field.id}>
                          <label htmlFor={field.id}>
                              <Input
                                    id={field.id}
                                    type="file"
                                    accept="image/*,application/pdf"
                                    onChange={(e) => handleFileChange(e, field.id)}
                              />
                              <Button variant="outlined" component="span" color="primary" fullWidth
                                      sx={{textTransform: 'capitalize', py: 1.5}}>
                                  Upload {field.id.charAt(0).toUpperCase() + field.id.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                              </Button>
                          </label>
                          {validationErrors[field.id] &&
                                <Typography color="error">{validationErrors[field.id]}</Typography>}
                          {fileInputs[field.id] && (
                                <Box mt={2} textAlign="center">
                                    {fileInputs[field.id].type === 'application/pdf' ? (
                                          <Typography variant="body2">{fileInputs[field.id].name}</Typography>
                                    ) : (
                                          <Tooltip title="Full screen">
                                              <img
                                                    src={URL.createObjectURL(fileInputs[field.id])}
                                                    alt={field.id}
                                                    className="w-[200px] max-h-[200px] object-contain"
                                                    style={{cursor: 'pointer'}}
                                                    onClick={() => handleImageClick(fileInputs[field.id])}
                                              />
                                          </Tooltip>
                                    )}
                                </Box>
                          )}
                          <Typography variant="body2" color="error">{comment}</Typography>
                      </FormControl>
                );
            case 'ibanBank':
                return (
                      <Controller
                            name="ibanBank"
                            control={control}
                            rules={{
                                required: 'IBAN is required',
                                pattern: {
                                    value: /^\d{21}$/,
                                    message: 'Invalid IBAN format, it should  21 digits'
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
                                        helperText={errors.ibanBank ? errors.ibanBank.message : 'Enter IBAN : 21 digits'}
                                        sx={{bgcolor: 'background.default'}}
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">AE</InputAdornment>,
                                        }}
                                        value={field.value}
                                        onChange={(e) => {
                                            if (e.target.value.length === 22) return;
                                            return field.onChange(e.target.value)
                                        }}
                                  />
                            )}
                      />
                );
            case 'emiratesId':
                return (
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
                                        type={"input"}
                                        margin="normal"
                                        error={!!errors.emiratesId}
                                        helperText={errors.emiratesId ? errors.emiratesId.message : 'Enter 15 digits'}
                                        sx={{bgcolor: 'background.default'}}
                                        value={field.value}
                                        onChange={(e) => {
                                            if (e.target.value.length === 16) return;
                                            return field.onChange(e.target.value)
                                        }}
                                  />
                            )}
                      />
                )
            default:
                return (
                      <Controller
                            name={field.id}
                            control={control}
                            rules={{required: `${field.id.replace(/([A-Z])/g, ' $1').trim()} is required`}}
                            render={({field: controllerField}) => (
                                  <TextField
                                        {...controllerField}
                                        label={controllerField.name.charAt(0).toUpperCase() + controllerField.name.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                                        fullWidth
                                        margin="normal"
                                        error={!!errors[controllerField.name]}
                                        helperText={errors[controllerField.name] ? errors[controllerField.name].message : comment}
                                        sx={{bgcolor: 'background.default'}}
                                  />
                            )}
                      />
                );
        }
    };

    if (decoding) return null;

    return (
          <Container maxWidth="md"
                     sx={{bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: 3, marginX: 'auto', my: 20}}>
              <Typography variant="h4" gutterBottom textAlign="center" className={"text-primary"}>Email
                  Confirmation</Typography>
              <Typography variant="h5" gutterBottom textAlign="center">Complete Your Registration</Typography>
              <Typography variant="body1" gutterBottom textAlign="center">Please upload the required documents to
                  complete your registration.</Typography>
              <form onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={2}>
                      {incompleteFields.map((field) => (
                            <Grid item xs={12} sm={6} key={field.id}>
                                {renderInputField(field, field.comment)}
                            </Grid>
                      ))}
                  </Grid>
                  <Box display="flex" justifyContent="center" mt={4}>
                      <Button variant="contained" color="primary" type="submit" sx={{px: 4, py: 1.5}}>
                          Submit Files
                      </Button>
                  </Box>
                  <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                      <Box sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '100vh',
                          bgcolor: 'background.default', position: "relative",
                          p: 4
                      }}>
                          <IconButton
                                onClick={() => setModalOpen(false)}
                                sx={{
                                    position: "absolute",
                                    top: 15,
                                    right: 15
                                }}
                          >
                              <IoMdClose/>

                          </IconButton>
                          {modalImage &&
                                <img src={URL.createObjectURL(modalImage)} alt="Full size"
                                     style={{maxHeight: '90%', maxWidth: '90%'}}
                                />
                          }
                      </Box>
                  </Modal>
              </form>
          </Container>
    );
};

export default UncompletedForm;
