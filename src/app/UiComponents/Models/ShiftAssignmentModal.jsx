import React, {useState} from "react";
import {
    Box,
    Button,
    Fade,
    FormControlLabel,
    Modal,
    Checkbox,
    Typography,
    Snackbar,
    Alert,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from "@mui/material";
import SearchComponent from "@/app/UiComponents/FormComponents/SearchComponent";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";
import {simpleModalStyle} from "@/app/constants";

const ShiftAssignmentModal = ({shifts, setData, label, href, item}) => {
    const [open, setOpen] = useState(false);
    const [selectedShifts, setSelectedShifts] = useState([]);
    const {setLoading} = useToastContext();
    const [filters, setFilters] = useState({});
    const selectedUserId = filters.userId;
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("error");
    const [otherCenters, setOtherCenters] = useState(null);
    const [attendAdditionalDuty, setAttendAdditionalDuty] = useState(false);
    const [selectedAdditionalDuty, setSelectedAdditionalDuty] = useState(null);

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setSelectedShifts([]);
        setFilters({});
        setAttendAdditionalDuty(false);
        setSelectedAdditionalDuty(null);
    };

    const handleShiftChange = (shiftId) => {
        setSelectedShifts((prevSelectedShifts) =>
              prevSelectedShifts.includes(shiftId)
                    ? prevSelectedShifts.filter((id) => id !== shiftId)
                    : [...prevSelectedShifts, shiftId]
        );
    };

    const onSubmit = async () => {
        if (!selectedUserId || selectedShifts.length === 0) {
            setSnackbarMessage("Please select a user and at least one shift.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        if (!filters.duty && !selectedAdditionalDuty) {
            setSnackbarMessage("This user is not assigned to a role currently. Contact the administrator.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const formData = {
            userId: selectedUserId,
            shiftIds: selectedShifts,
            duty: attendAdditionalDuty && selectedAdditionalDuty ? selectedAdditionalDuty : filters.duty,
            date: item.date,
            examType: item.examType,
        };

        const result = await handleRequestSubmit(formData, setLoading, href, false, "Assigning shifts...");
        if (result.status === 200) {
            if (setData) {
                setData((prevData) => [...prevData, result.data]);
            }
            handleClose();
            setSnackbarMessage("Shifts assigned successfully.");
            setSnackbarSeverity("success");
            setSnackbarOpen(true);
        } else {
            setSnackbarMessage(result.message || "An error occurred. Please try again.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };

    return (
          <>
              <Button variant="contained" color="secondary" onClick={handleOpen}>
                  {label}
              </Button>
              <Modal open={open} onClose={handleClose} sx={{z: 999}}>
                  <Fade in={open}>
                      <Box sx={{...simpleModalStyle}}>
                          <Typography variant="h6" sx={{mb: 2}}>
                              Assign Shifts
                          </Typography>
                          <FormControlLabel
                                control={
                                    <Checkbox
                                          checked={otherCenters}
                                          onChange={(e) => setOtherCenters(e.target.checked)}
                                    />
                                }
                                label="Search in other centers"
                          />
                          <SearchComponent
                                apiEndpoint={`/api/index?id=user&otherDuty=true&centerId=${!otherCenters}`}
                                setFilters={setFilters}
                                inputLabel="Search User By EmiratesId"
                                renderKeys={["name", "emiratesId", "email"]}
                                mainKey="emiratesId"
                          />
                          {filters.additionalDuties?.length > 0 && (
                                <Box sx={{mt: 2}}>
                                    <FormControlLabel
                                          control={
                                              <Checkbox
                                                    checked={attendAdditionalDuty}
                                                    onChange={(e) => setAttendAdditionalDuty(e.target.checked)}
                                              />
                                          }
                                          label="Attend Another Duty?"
                                    />
                                    {attendAdditionalDuty && (
                                          <FormControl fullWidth sx={{mt: 2}}>
                                              <InputLabel>Select Another Duty</InputLabel>
                                              <Select
                                                    value={selectedAdditionalDuty}
                                                    onChange={(e) => setSelectedAdditionalDuty(e.target.value)}
                                              >
                                                  {filters.additionalDuties.map((dutyObj, index) => (
                                                        <MenuItem key={index} value={dutyObj.duty}>
                                                            {dutyObj.duty.name}
                                                        </MenuItem>
                                                  ))}
                                              </Select>
                                          </FormControl>
                                    )}
                                </Box>
                          )}
                          <Box sx={{mt: 2, mb: 2}}>
                              {shifts.map((shift) => (
                                    <FormControlLabel
                                          key={shift.id}
                                          control={
                                              <Checkbox
                                                    checked={selectedShifts.includes(shift.id)}
                                                    onChange={() => handleShiftChange(shift.id)}
                                              />
                                          }
                                          label={`${shift.name} (Duration: ${shift.duration})`}
                                    />
                              ))}
                          </Box>
                          <Button variant="contained" color="primary" onClick={onSubmit}>
                              Submit
                          </Button>
                      </Box>
                  </Fade>
              </Modal>
              <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
              >
                  <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{width: '100%'}}>
                      {snackbarMessage}
                  </Alert>
              </Snackbar>
          </>
    );
};

export default ShiftAssignmentModal;
