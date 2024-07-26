import React, { useState } from "react";
import {Alert, Backdrop, Box, Fade, Modal, Snackbar, Button, Typography} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";

export default function DeleteModal({
                                        open,
                                        handleClose,
                                        item,
                                        setData,
                                        href
                                    }) {
const {setLoading}=useToastContext()

    const handleDelete = async () => {

            const result = await handleRequestSubmit({}, setLoading, `${href}/${item.id}`, false, "Deleting...", null, "DELETE");

            if (result) {
                setData((prevData) =>
                      prevData.filter((dataItem) => dataItem.data.id !== item.id)
                );
            }

    };

    return (
          <>
              <Modal
                    open={open}
                    onClose={handleClose}
                    closeAfterTransition
              >
                  <Fade in={open}>
                      <Box sx={{ ...modalStyle }}>
                          <Typography variant="h6" component="h2">
                              Are you sure you want to delete this item?
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                              <Button variant="contained" color="secondary" onClick={handleDelete}>
                                  Delete
                              </Button>
                              <Button variant="contained" onClick={handleClose} sx={{ marginLeft: '8px' }}>
                                  Cancel
                              </Button>
                          </Box>

                      </Box>
                  </Fade>
              </Modal>

          </>
    );
};

const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    maxHeight: "90%",
    overflow: "auto",
    width: {
        xs: "100%",
        sm: "80%",
        md: "60%",
    },
    maxWidth: {
        md: "600px",
    },
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
};
