import {useState, useEffect} from "react";
import {
    Modal,
    Button,
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Divider,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle
} from "@mui/material";
import {AiOutlineDelete} from "react-icons/ai";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";
import {colors, simpleModalStyle} from "@/app/constants";

const AssignNewDutyModal = ({selectedItem, allDuties, onUpdate}) => {
    const [open, setOpen] = useState(false);
    const [selectedDuty, setSelectedDuty] = useState("");
    const [userDuties, setUserDuties] = useState([...selectedItem?.additionalDuties] || []);
    const [newDuties, setNewDuties] = useState([]);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dutyToRemove, setDutyToRemove] = useState(null);
    const {setLoading} = useToastContext();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleAddDuty = (duty) => {
        if (duty && !userDuties.find(ud => ud.dutyId === duty.id) && !newDuties.find(nd => nd.dutyId === duty.id)) {
            setNewDuties([...newDuties, {dutyId: duty.id, duty}]);
        }
        setSelectedDuty("");
    };

    const handleRemoveDuty = async () => {
        const res = await handleRequestSubmit({dutyId: dutyToRemove}, setLoading, `/admin/employees/${selectedItem.id}/duties`, false, "Deleting", null, "DELETE");
        if (res.status === 200) {
            const updatedDuties = userDuties.filter(duty => duty.dutyId !== dutyToRemove);
            setUserDuties(updatedDuties);
            onUpdate(selectedItem.id, updatedDuties);
            setDialogOpen(false);
            setDutyToRemove(null);
        }
    };

    const confirmRemoveDuty = (dutyId) => {
        setDutyToRemove(dutyId);
        setDialogOpen(true);
    };

    const handleRemoveNewDuty = (dutyId) => {
        setNewDuties(newDuties.filter(duty => duty.dutyId !== dutyId));
    };

    const handleSave = async () => {
        const dutyIds = newDuties.map(duty => duty.dutyId);
        const res = await handleRequestSubmit({duties: dutyIds}, setLoading, `/admin/employees/${selectedItem.id}/duties`, false, "Updating");

        if (res.status === 200) {
            const updatedDuties = [...userDuties, ...newDuties];
            onUpdate(selectedItem.id, updatedDuties);
            setNewDuties([]);
            handleClose();
        }
    };

    useEffect(() => {
        setUserDuties(selectedItem?.additionalDuties || []);
        setNewDuties([]);
    }, [selectedItem]);

    return (
          <>
              <Button onClick={handleOpen}>
                  {userDuties.length > 0 ? "Other Duties" : "Assign Other Duty"}
              </Button>
              <Modal open={open} onClose={handleClose}>
                  <Box sx={simpleModalStyle}>
                      <Typography variant="h6" sx={{mb: 2}}>Manage Additional Duties</Typography>

                      <FormControl fullWidth sx={{mb: 3}}>
                          <InputLabel>Select Duty</InputLabel>
                          <Select value={selectedDuty} onChange={(e) => handleAddDuty(e.target.value)}>
                              {allDuties.map(duty => (
                                    <MenuItem key={duty.id} value={duty}
                                              disabled={userDuties.some(ud => ud.dutyId === duty.id || duty.id === selectedItem.duty.id)}>
                                        {duty.name}
                                    </MenuItem>
                              ))}
                          </Select>
                      </FormControl>

                      <Divider sx={{mb: 3}}/>

                      <Box sx={{mb: 3}}>
                          <Typography variant="body1" sx={{fontWeight: 'bold'}}>New Duties to Assign:</Typography>
                          {newDuties.length > 0 ? newDuties.map(duty => (
                                <Box key={duty.dutyId} sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mt: 1,
                                    p: 1,
                                    borderRadius: 1,
                                    backgroundColor: '#f9f9f9'
                                }}>
                                    <Typography>{duty.duty.name}</Typography>
                                    <IconButton color="secondary" onClick={() => handleRemoveNewDuty(duty.dutyId)}>
                                        <AiOutlineDelete/>
                                    </IconButton>

                                </Box>
                          )) : <Typography>No new duties selected.</Typography>}
                      </Box>

                      <Divider sx={{mb: 3}}/>

                      <Box>
                          <Typography variant="body1" sx={{fontWeight: 'bold'}}>Current Assigned Duties:</Typography>
                          {userDuties.map(duty => (
                                <Box key={duty.dutyId} sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mt: 1,
                                    p: 1,
                                    borderRadius: 1,
                                    backgroundColor: '#f0f0f0'
                                }}>
                                    <Typography>{duty.duty.name}</Typography>
                                    <IconButton color="secondary" onClick={() => confirmRemoveDuty(duty.dutyId)}>
                                        <AiOutlineDelete/>
                                    </IconButton>
                                </Box>
                          ))}
                          <Divider sx={{mb: 3}}/>

                          <Box sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mt: 1,
                              p: 1,
                              borderRadius: 1,
                              backgroundColor: "#eeeeee"
                          }}>
                              <Typography> <span className={"font-bold"}>main duty:</span> {selectedItem.duty.name}
                              </Typography>
                          </Box>
                      </Box>

                      <Button variant="contained" onClick={handleSave} sx={{mt: 3}}>Save</Button>
                  </Box>
              </Modal>

              <Dialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
              >
                  <DialogTitle>Confirm Delete</DialogTitle>
                  <DialogContent>
                      <DialogContentText>
                          Are you sure you want to delete this duty?
                      </DialogContentText>
                  </DialogContent>
                  <DialogActions>
                      <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                      <Button onClick={handleRemoveDuty} color="error">Delete</Button>
                  </DialogActions>
              </Dialog>
          </>
    );
};

export default AssignNewDutyModal;
