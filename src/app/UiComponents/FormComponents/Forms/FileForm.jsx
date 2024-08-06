"use client";
import React, {useState} from 'react';
import {useForm} from 'react-hook-form';
import {
    Button,
    FormControl,
    Box,
    Typography,
    Modal,
    Grid,
    Container, IconButton, Tooltip,
} from '@mui/material';
import {styled} from '@mui/material/styles';
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";
import {IoMdClose} from "react-icons/io";
import {useSearchParams} from "next/navigation";

const Input = styled('input')({
    display: 'none',
});

const FileUploadForm = () => {
    const {handleSubmit, control, register, setValue, formState: {errors}} = useForm(

    );
    const searchParams = useSearchParams()
    const token = searchParams.get("token");
    const [submitted, setSubmitted] = useState(false)
    const {setLoading} = useToastContext();
    const [fileInputs, setFileInputs] = useState({
        emiratesIdPhoto: null,
        ibanBankPhoto: null,
        graduationImage: null,
        passportPhoto: null,
        photo: null,
    });
    const [validationErrors, setValidationErrors] = useState({});

    const [modalOpen, setModalOpen] = useState(false);
    const [modalImage, setModalImage] = useState(null);

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
        Object.keys(fileInputs).forEach(key => {
            if (fileInputs[key]) {
                formData.append(key, fileInputs[key]);
            }
        });
        const res = await handleRequestSubmit(formData, setLoading, "employee/public/complete?token=" + token, true, "Sending...", false, "POST");
        if (res.status === 200) {
            setSubmitted(true)
        }
    };

    if (submitted) {
        return (
              <Container maxWidth="md"
                         sx={{
                             bgcolor: 'background.paper',
                             p: 3,
                             borderRadius: 2,
                             boxShadow: 3,
                             marginX: 'auto',
                             my: 20
                         }}>
                  <Typography variant="h6" color="success.main" textAlign="center" gutterBottom>
                      Your account has been confirmed successfully
                  </Typography>
                  <Typography variant="body1" textAlign="center">
                      We will send u an email once we approve your account details
                  </Typography>
              </Container>
        )
    }


    const handleImageClick = (file) => {
        setModalImage(file);
        setModalOpen(true);
    };
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
                      {fileInputs && Object.keys(fileInputs).map((field) => (
                            <Grid item xs={12} sm={6} key={field}>
                                <FormControl fullWidth margin="normal">
                                    <label htmlFor={field}>
                                        <Input
                                              id={field}
                                              type="file"
                                              accept={field === "photo" ? "image/*" : "image/*,application/pdf"}
                                              onChange={(e) => handleFileChange(e, field)}
                                        />
                                        <Button variant="outlined" component="span" color="primary" fullWidth
                                                sx={{textTransform: 'capitalize', py: 1.5}}>
                                            Upload {field === "photo" ? field : field.replace(/([A-Z])/g, ' $1').replace(/(image|photo)$/i, 'document').trim()}
                                        </Button>
                                    </label>
                                    {validationErrors[field] &&
                                          <Typography color="error">{validationErrors[field]}</Typography>}
                                    {fileInputs[field] && (
                                          <Box mt={2} textAlign="center">
                                              {fileInputs[field].type === 'application/pdf' ? (
                                                    <Typography variant="body2">{fileInputs[field].name}</Typography>
                                              ) : (
                                                    <Tooltip title="Full screen">
                                                        <img
                                                              src={URL.createObjectURL(fileInputs[field])}
                                                              alt={field}
                                                              className="w-[200px] max-h-[200px] object-contain "
                                                              style={{cursor: 'pointer'}}
                                                              onClick={() => handleImageClick(fileInputs[field])}
                                                        />
                                                    </Tooltip>
                                              )}
                                          </Box>
                                    )}
                                </FormControl>
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

export default FileUploadForm;
