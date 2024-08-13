import React, {useState} from 'react';
import {Button, Modal, Box, Typography, MenuItem, Select, FormControl, InputLabel, TextField} from '@mui/material';
import FilterSelect from '@/app/UiComponents/FormComponents/FilterSelect';
import SearchComponent from '@/app/UiComponents/FormComponents/SearchComponent';
import DateComponent from "@/app/UiComponents/FormComponents/MUIInputs/DateChangerComponent";
import dayjs from "dayjs";
import {simpleModalStyle} from "@/app/constants";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";

const ReminderButton = ({centers}) => {
    const [open, setOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedCenter, setSelectedCenter] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [message, setMessage] = useState('');
    const {setLoading} = useToastContext()
    const [triggerReset, setTrigger] = useState(null)
    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setConfirmOpen(false);
    };

    const handleCenterChange = (event) => {
        setSelectedCenter(event.target.value);
        setSelectedUser(null); // Reset the user selection when the center changes
        setTrigger(!triggerReset)
    };

    const handleDateChange = (newDate) => {
        setSelectedDate(newDate ? dayjs(newDate).format('YYYY-MM-DD') : null);
    };

    const handleUserSelect = (user) => {
        setSelectedCenter("all")
        setSelectedUser(user);

    };

    const handleMessageChange = (event) => {
        setMessage(event.target.value);
    };

    const handleClearDate = () => {
        setSelectedDate(null);
    };

    const handleSubmit = async () => {
        let url = `/finincal/reminder`;
        let params = new URLSearchParams();

        if (selectedUser) {
            params.append('userId', selectedUser.userId);
        } else if (selectedCenter) {
            params.append('centerId', selectedCenter);
        }

        if (selectedDate) {
            params.append('date', selectedDate);
        }

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        const response = await handleRequestSubmit({message}, setLoading, url, false, "Remindering", false, "POST")

        if (response.status === 200) {

            handleClose();
        }
    };

    const handleConfirm = () => {
        setConfirmOpen(true);
    };

    const renderConfirmationMessage = () => {
        if (selectedUser) {
            return selectedDate
                  ? `We will send a reminder to ${selectedUser.name} for the date ${selectedDate}.`
                  : `We will send a reminder to ${selectedUser.name} for all pending attendances.`;
        } else if (selectedCenter) {
            return selectedDate
                  ? `We will send reminders to all users in the ${centers.find(c => c.id === selectedCenter).name} center for the date ${selectedDate}.`
                  : `We will send reminders to all users in the ${centers.find(c => c.id === selectedCenter).name} center for all pending attendances.`;
        } else {
            return selectedDate
                  ? `We will send reminders to all users in all centers for the date ${selectedDate}.`
                  : `We will send reminders to all users in all centers for all pending attendances.`;
        }
    };

    return (
          <>
              <Button variant="outlined" color="primary" onClick={handleOpen}>
                  Send Reminders
              </Button>

              <Modal
                    open={open}
                    onClose={handleClose}
                    aria-labelledby="send-reminder-modal"
                    aria-describedby="send-reminder-modal-description"
              >
                  <Box sx={simpleModalStyle}>
                      <Typography variant="h6" component="h2" id="send-reminder-modal">
                          Send Reminders
                      </Typography>

                      <FilterSelect
                            options={centers}
                            label={"Centers"}
                            onChange={handleCenterChange}
                            loading={false}
                            value={selectedCenter}
                      />

                      <SearchComponent
                            apiEndpoint={"/api/index?id=user"}
                            setFilters={handleUserSelect}
                            inputLabel="Search User By EmiratesId"
                            renderKeys={["name", "emiratesId", "email"]}
                            mainKey="emiratesId"
                            resetTrigger={triggerReset}
                      />

                      <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 2}}>
                          <DateComponent
                                date={selectedDate}
                                handleDateChange={handleDateChange}
                                label="Select a day"
                          />
                          <Button variant="text" color="primary" onClick={handleClearDate}>
                              Select All Dates
                          </Button>
                      </Box>

                      <TextField
                            label="Message"
                            value={message}
                            onChange={handleMessageChange}
                            multiline
                            rows={4}
                            fullWidth
                            required
                            sx={{mt: 3}}
                      />

                      <Box sx={{mt: 3, display: 'flex', justifyContent: 'flex-end'}}>
                          <Button
                                variant="contained"
                                color="primary"
                                onClick={handleConfirm}
                          >
                              Next
                          </Button>
                      </Box>
                  </Box>
              </Modal>

              <Modal
                    open={confirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    aria-labelledby="confirm-reminder-modal"
                    aria-describedby="confirm-reminder-modal-description"
              >
                  <Box sx={simpleModalStyle}>
                      <Typography variant="h6" component="h2" id="confirm-reminder-modal">
                          Confirm Send Reminders
                      </Typography>
                      <Typography sx={{mt: 2}} id="confirm-reminder-modal-description">
                          {renderConfirmationMessage()}
                      </Typography>
                      <Box sx={{mt: 3, display: 'flex', justifyContent: 'space-between'}}>
                          <Button variant="outlined" onClick={() => setConfirmOpen(false)}>
                              No, Go Back
                          </Button>
                          <Button
                                variant="contained"
                                color="primary"
                                onClick={handleSubmit}
                          >
                              Yes, Send
                          </Button>
                      </Box>
                  </Box>
              </Modal>
          </>
    );
};

export default ReminderButton;
