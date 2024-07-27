import React, { useState } from "react";
import {
  Alert,
  Backdrop,
  Box,
  Button,
  Fade,
  Modal,
} from "@mui/material";
import {Form} from "@/app/UiComponents/FormComponents/Forms/Form";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";
import {simpleModalStyle} from "@/app/constants";

const CreateModal = ({
  setData,
  label,
  inputs,
  href,
  extraProps,handleSubmit,setTotal,BtnColor="secondary"
}) => {
  const [open, setOpen] = useState(false);
  const {setLoading}=useToastContext()


  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const onSubmit = async (formData) => {
    if(extraProps.extraId){
      href=`${href}?extraId=${extraProps.extraId}`
    }



const result=await handleRequestSubmit(formData, setLoading, `${href}`, false, "Creating...");
      if (result.status===200) {
        if(handleSubmit){
            handleSubmit(result.data);
        }else{
        setData((prevData) => [...prevData, result.data]);
          setTotal((prev)=>prev+1)
          handleClose();
        }
      }

  };

  return (
    <>
      <div className={"px-2 mb-1 mt-2"}>
        <Button variant="contained" color={BtnColor} onClick={handleOpen }>
          {label}
        </Button>
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        sx={{
          z : 999,
        }}
      >
        <Fade in={open}>
          <Box sx={{ ...simpleModalStyle }}>
            <Form
              onSubmit={onSubmit}
              inputs={inputs}
              {...extraProps}
            >
            </Form>
          </Box>
        </Fade>
      </Modal>
    </>
  );
};


export default CreateModal;

