import React, { useState } from "react";
import {Alert, Backdrop, Box, Fade, Modal, Snackbar, Button, Typography} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";
import {simpleModalStyle} from "@/app/constants";

export default function DeleteModal({
                                        open,
                                        handleClose,
                                        item,
                                        setData,
                                        href,setTotal
                                    }) {
const {setLoading}=useToastContext()

    const handleDelete = async () => {

            const result = await handleRequestSubmit({}, setLoading, `${href}/${item.id}`, false, "Deleting...", null, "DELETE");

            if (result.status===200) {
                setData((prevData) =>
                      prevData.filter((dataItem) => dataItem.id !== item.id)
                );
                setTotal((prev)=>prev-1)
                handleClose();
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
                      <Box sx={{ ...simpleModalStyle }}>
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

