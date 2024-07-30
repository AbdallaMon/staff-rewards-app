"use client";
import React, {useState} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {
    Button,
    FormControl,
    Box,
    Typography,
    Modal,
    Grid,
} from '@mui/material';
import {styled} from '@mui/material/styles';
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";

const Input = styled('input')({
    display: 'none',
});

const FileUploadForm = () => {
    const {handleSubmit, control, setValue, formState: {errors}} = useForm();
    const {setLoading} = useToastContext();
    const [fileInputs, setFileInputs] = useState({
        emiratesIdPhoto: null,
        ibanBankPhoto: null,
        graduationImage: null,
        passportPhoto: null,
        photo: null,
    });
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
        } else {
            alert('Only image or PDF files are allowed');
        }
    };

    const onSubmit = async (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            formData.append(key, data[key]);
        });
        Object.keys(fileInputs).forEach(key => {
            if (fileInputs[key]) {
                formData.append(key, fileInputs[key]);
            }
        });
        await handleRequestSubmit(formData, setLoading, "staff/public", true, "Sending...", false, "POST");
    };

    const handleImageClick = (file) => {
        setModalImage(file);
        setModalOpen(true);
    };

    return (
          <Container maxWidth="md"
                     sx={{bgcolor: 'background.paper', p: 3, borderRadius: 2, boxShadow: 3, marginX: 'auto'}}>
              <Typography variant="h4" gutterBottom textAlign="center">Upload Your Documents</Typography>
              <form onSubmit={handleSubmit(onSubmit)}>
                  <Grid container spacing={2}>
                      {Object.keys(fileInputs).map((field) => (
                            <Grid item xs={12} sm={6} key={field}>
                                <FormControl fullWidth margin="normal">
                                    <label htmlFor={field}>
                                        <Input
                                              id={field}
                                              type="file"
                                              accept="image/*,application/pdf"
                                              onChange={(e) => handleFileChange(e, field)}
                                        />
                                        <Button variant="contained" component="span" color="primary" fullWidth>
                                            Upload {field}
                                        </Button>
                                    </label>
                                    {errors[field] && <Typography color="error">{errors[field].message}</Typography>}
                                    {fileInputs[field] && (
                                          <Box mt={2} textAlign="center">
                                              {fileInputs[field].type === 'application/pdf' ? (
                                                    <Typography variant="body2">{fileInputs[field].name}</Typography>
                                              ) : (
                                                    <img
                                                          src={URL.createObjectURL(fileInputs[field])}
                                                          alt={field}
                                                          width="100"
                                                          style={{cursor: 'pointer'}}
                                                          onClick={() => handleImageClick(fileInputs[field])}
                                                    />
                                              )}
                                          </Box>
                                    )}
                                </FormControl>
                            </Grid>
                      ))}
                  </Grid>
                  <Box display="flex" justifyContent="center" mt={4}>
                      <Button variant="contained" color="primary" type="submit">
                          Submit Files
                      </Button>
                  </Box>
                  <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
                      <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                          {modalImage && <img src={URL.createObjectURL(modalImage)} alt="Full size"
                                              style={{maxHeight: '90%', maxWidth: '90%'}}/>}
                      </Box>
                  </Modal>
              </form>
          </Container>
    );
};

export default FileUploadForm;
