import React, { useState } from "react";
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
} from "@mui/material";
import SearchComponent from "@/app/UiComponents/FormComponents/SearchComponent";
import { handleRequestSubmit } from "@/helpers/functions/handleSubmit";
import { useToastContext } from "@/providers/ToastLoadingProvider";
import { simpleModalStyle } from "@/app/constants";

const ShiftAssignmentModal = ({ shifts, setData, label, href, extraProps, item }) => {
    const [open, setOpen] = useState(false);
    const [selectedShifts, setSelectedShifts] = useState([]);
    const { setLoading } = useToastContext();
    const [filters, setFilters] = useState({});
    const selectedUserId = filters.userId;
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("error");

    const handleOpen = () => setOpen(true);
    const handleClose = () => {
        setOpen(false);
        setSelectedShifts([]);
        setFilters({});
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

        if (!filters.duty) {
            setSnackbarMessage("This user is not assigned to a role currently. Contact the administrator.");
            setSnackbarSeverity("error");
            setSnackbarOpen(true);
            return;
        }

        const formData = {
            userId: selectedUserId,
            shiftIds: selectedShifts,
            duty: filters.duty,
            date: item.date,
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
              <Modal open={open} onClose={handleClose} sx={{ z: 999 }}>
                  <Fade in={open}>
                      <Box sx={{ ...simpleModalStyle }}>
                          <Typography variant="h6" sx={{ mb: 2 }}>
                              Assign Shifts
                          </Typography>
                          <SearchComponent
                                apiEndpoint="/api/index?id=user&centerId=true"
                                setFilters={setFilters}
                                inputLabel="Search User By EmiratesId"
                                renderKeys={["name", "emiratesId", "email"]}
                                mainKey="emiratesId"
                          />
                          <Box sx={{ mt: 2, mb: 2 }}>
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
                  <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
                      {snackbarMessage}
                  </Alert>
              </Snackbar>
          </>
    );
};

export default ShiftAssignmentModal;
