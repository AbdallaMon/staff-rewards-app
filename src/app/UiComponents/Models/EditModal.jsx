import React, {useEffect, useState} from 'react';
import {Box, Fade, Modal} from '@mui/material';
import {Form} from "@/app/UiComponents/FormComponents/Forms/Form";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";

const EditModal = ({ open, handleClose, item, inputs, setData, href, checkChanges = false }) => {
    const [options, setOptions] = useState({});
const {setLoading}=useToastContext()
    useEffect(() => {
        inputs.forEach(async (input) => {
            if (input.getData) {
                const result = await input.getData();
                setOptions((prevOptions) => ({
                    ...prevOptions,
                    [input.data.id]: result.data,
                }));
            }
        });
    }, [inputs, item]);

    const onSubmit = async (formData) => {
        let dataToSubmit = formData;
        if (checkChanges) {
            dataToSubmit = {};
            for (let key in formData) {
                if (formData[key] !== item[key]) {
                    dataToSubmit[key] = formData[key];
                }
            }
        }

        const result = await handleRequestSubmit(dataToSubmit, setLoading, `${href}/${item.id}`, false, "Updating...",null,"PUT");
            if (result.status===200) {
                setData((prevData) => prevData.map((dataItem) => dataItem.id === result.data.id ? result.data : dataItem));
                handleClose();
            }
    };
    const prefilledInputs = inputs.map(input => ({
        ...input,
        data: {
            ...input.data,
            defaultValue: item[input.data.id] ?? input.data.defaultValue,
        }
    }));

    return (
          <>

              <Modal
                    open={open}
                    onClose={handleClose}
                    closeAfterTransition

              >
                  <Fade in={open}>
                      <Box sx={{...modalStyle}}>
                          <Form
                                onSubmit={onSubmit}
                                inputs={prefilledInputs.map(input => ({
                                    ...input,
                                    data: {
                                        ...input.data,
                                        // options: options[input.data.id],
                                        defaultValue :input.data.parentId? item[input.data.parentId]?.id : item[input.data.id]
                                    }


                                }))}
                                formTitle={`Edit ${item.title||item.name||item.id}`}
                                btnText="Save Changes"
                          >
                          </Form>

                      </Box>
                  </Fade>
              </Modal>

          </>
    );
};

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    maxHeight: '90%',
    overflow: "auto",
    width: {
        xs: '100%',
        sm: '80%',
        md: '60%',
    },
    maxWidth: {
        md: '600px',
    },
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};

export default EditModal;
