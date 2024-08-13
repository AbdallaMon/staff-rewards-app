import React, {useState} from 'react';
import {Button, Modal, Box, Typography, TextField} from '@mui/material';
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {simpleModalStyle} from "@/app/constants";
import {useToastContext} from "@/providers/ToastLoadingProvider";
import dayjs from "dayjs";

const RemoveAttendanceButton = ({item, setData}) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const {setLoading: setToastLoading} = useToastContext();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleConfirm = async () => {
        const response = await handleRequestSubmit({
            userId: item.user.id,
            dayAttendanceId: item.id,
            userEmail: item.user.email,
            userName: item.user.name,
            centerName: item.user.center.name,
            date: item.date,
            message: message,  // Add the custom message here
        }, setToastLoading, `/finincal/reminder/remove`, false, "Removing Attachment", false, "POST");

        if (response.status === 200) {
            setData(prevData => prevData.map(dataItem =>
                  dataItem.id === item.id ? {...dataItem, attachment: null} : dataItem
            ));
            handleClose();
        }
    };

    const renderConfirmationMessage = () => (
          <>
              <Typography sx={{mt: 2}}>
                  We will nullify the attachment for the attendance on {dayjs(item.date).format('DD/MM/YYYY')}
                  at {item.user.center.name} and send a reminder to {item.user.name}.
              </Typography>
              <TextField
                    label="Custom Message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    multiline
                    rows={4}
                    fullWidth
                    sx={{mt: 2}}
                    placeholder="Enter a custom message to include in the reminder email"
              />
          </>
    );

    return (
          <>
              <Button variant="outlined" color="secondary" onClick={handleOpen}>
                  Remove & Ask to Edit
              </Button>

              <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="confirm-remove-modal"
                    aria-describedby="confirm-remove-modal-description"
              >
                  <Box sx={simpleModalStyle}>
                      <Typography variant="h6" component="h2" id="confirm-remove-modal">
                          Confirm Remove Attachment
                      </Typography>
                      {renderConfirmationMessage()}
                      <Box sx={{mt: 3, display: 'flex', justifyContent: 'space-between'}}>
                          <Button variant="outlined" onClick={handleClose}>
                              No, Go Back
                          </Button>
                          <Button
                                variant="contained"
                                color="primary"
                                onClick={handleConfirm}
                          >
                              Yes, Confirm
                          </Button>
                      </Box>
                  </Box>
              </Modal>
          </>
    );
};

export default RemoveAttendanceButton;
