import React, {useState} from 'react';
import {
    Modal,
    Box,
    Typography,
    Checkbox,
    TextField,
    Button,
    IconButton,
    Grid,
    FormControlLabel,
    Alert
} from '@mui/material';
import {FaTimes} from 'react-icons/fa';
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";

const UncompletedModal = ({open, onClose, handleSubmit, title, href}) => {
    const [checks, setChecks] = useState([]);
    const [comments, setComments] = useState({});
    const [errors, setErrors] = useState({});
    const {setLoading} = useToastContext();

    const fieldMappings = {
        "Name": "name",
        "Phone": "phone",
        "Duty": "dutyId",
        "Zone": "zone",
        "Center": "centerId",
        "Bank User Name": "bankUserName",
        "Bank Name": "bankName",
        "Bank Iban": "ibanBank",
        "Emirates ID": "emiratesId",
        "Graduation Name": "graduationName",
        "Passport Number": "passportNumber",
        "User Photo": "photo",
        "Emirates ID Photo": "emiratesIdPhoto",
        "IBAN Photo": "ibanBankPhoto",
        "Graduation Image": "graduationImage",
        "Passport Photo": "passportPhoto"
    };

    const handleCheckChange = (event) => {
        const {name, checked} = event.target;
        setChecks((prev) => {
            if (checked) {
                return [...prev, name];
            } else {
                const updatedChecks = prev.filter((check) => check !== name);
                const {[name]: _, ...remainingComments} = comments;
                setComments(remainingComments);
                return updatedChecks;
            }
        });
    };

    const handleCommentChange = (event) => {
        const {name, value} = event.target;
        setComments((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFormSubmit = async () => {
        const newErrors = {};
        checks.forEach((field) => {
            if (!comments[field]) {
                newErrors[field] = "Comment is required";
            }
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        const checksWithIds = checks.map((check) => ({
            id: fieldMappings[check],
            label: check,
            comment: comments[check]
        }));

        const formData = {checks: checksWithIds};
        const result = await handleRequestSubmit(formData, setLoading, href, false, "Submitting...");
        if (result.status === 200) {
            handleSubmit(result.data);
            onClose();
        }
    };

    return (
          <Modal open={open} onClose={onClose}>
              <Box sx={modalStyle}>
                  <IconButton onClick={onClose} sx={{position: 'absolute', right: 16, top: 16}}>
                      <FaTimes/>
                  </IconButton>
                  <Typography variant="h6" gutterBottom>{title}</Typography>
                  <Box sx={{mt: 2}}>
                      <Typography variant="body1" gutterBottom>Select Uncompleted Fields:</Typography>
                      <Grid container spacing={2}>
                          {Object.keys(fieldMappings).map((field) => (
                                <Grid item xs={12} sm={6} key={field}>
                                    <FormControlLabel
                                          control={<Checkbox name={field} onChange={handleCheckChange}/>}
                                          label={field}
                                    />
                                    {checks.includes(field) && (
                                          <>
                                              <TextField
                                                    name={field}
                                                    label="Comment"
                                                    variant="outlined"
                                                    size="small"
                                                    fullWidth
                                                    onChange={handleCommentChange}
                                                    sx={{mt: 1}}
                                                    error={Boolean(errors[field])}
                                                    helperText={errors[field]}
                                              />
                                          </>
                                    )}
                                </Grid>
                          ))}
                      </Grid>
                      <Box sx={{mt: 2, display: 'flex', justifyContent: 'flex-end'}}>
                          <Button variant="contained" color="primary" onClick={handleFormSubmit}>Submit</Button>
                      </Box>
                  </Box>
              </Box>
          </Modal>
    );
};

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: {
        xs: '90%',
        sm: '80%',
        md: '70%',
        lg: '60%',
        xl: '50%',
    },
    maxHeight: '80%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflowY: 'auto',
};

export default UncompletedModal;
