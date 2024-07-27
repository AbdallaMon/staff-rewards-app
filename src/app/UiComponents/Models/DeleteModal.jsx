import React from "react";
import { Box, Fade, Modal, Button, Typography} from "@mui/material";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";
import {simpleModalStyle} from "@/app/constants";

export default function DeleteModal({
                                        open,
                                        handleClose,
                                        item,
                                        setData,
                                        href,
                                        setTotal,
                                        archive = false
                                    }) {
    const {setLoading} = useToastContext();

    const handleDeleteOrArchive = async () => {
        const url = archive ? `${href}/${item.id}` : `${href}/${item.id}`;
        console.log(url,"url")
        const method = archive ? "PATCH" : "DELETE";
        const message = archive ? "Archiving..." : "Deleting...";

        const result = await handleRequestSubmit({}, setLoading, url, false, message, null, method);

        if (result.status === 200) {
            setData((prevData) =>
                  prevData.filter((dataItem) => dataItem.id !== item.id)
            );
            setTotal((prev) => prev - 1);
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
                              {archive ? "Are you sure you want to archive this item?" : "Are you sure you want to delete this item?"}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                              <Button variant="contained" color={archive ? "warning" : "secondary"} onClick={handleDeleteOrArchive}>
                                  {archive ? "Archive" : "Delete"}
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
}
