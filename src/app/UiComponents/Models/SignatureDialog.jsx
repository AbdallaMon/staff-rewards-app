import React, {useRef, useState} from 'react';
import {
    Box,
    Button,
    Dialog,
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Slide
} from '@mui/material';
import {IoMdClose} from 'react-icons/io';
import SignatureCanvas from 'react-signature-canvas';
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const SignatureDialog = ({user, open, onClose, onSignatureSaved}) => {
    const [previewMode, setPreviewMode] = useState(false);
    const [signatureUrl, setSignatureUrl] = useState(null);
    const sigCanvas = useRef({});
    const {setLoading: setToastLoading} = useToastContext();

    const handleClearCanvas = () => {
        if (sigCanvas.current) {
            sigCanvas.current.clear();
        }
    };

    const handleSaveSignature = () => {
        if (sigCanvas.current) {
            const canvas = sigCanvas.current.getTrimmedCanvas();
            const dataUrl = canvas.toDataURL('image/png');
            setSignatureUrl(dataUrl);
            setPreviewMode(true);
        }
    };

    const handleUploadSignature = async () => {
        try {
            const blob = await (await fetch(signatureUrl)).blob();
            const formData = new FormData();
            const uniqueName = `signature-${user.id}.png`;

            formData.append('signature', blob, uniqueName);

            const res = await handleRequestSubmit(
                  formData,
                  setToastLoading,
                  `employee/private/${user.id}`,
                  true,
                  "Saving Signature...",
                  null,
                  "PUT"
            );

            if (res.status === 200) {
                onSignatureSaved(signatureUrl); // Update the parent component with the new signature
                onClose(); // Close the dialog after successful submission
            }
        } catch (error) {
            console.error('Error uploading signature:', error);
        }
    };

    const handleRetry = () => {
        setSignatureUrl(null);
        if (sigCanvas.current) {
            sigCanvas.current.clear();
        }
        setPreviewMode(false);
    };

    return (
          <Dialog
                fullScreen
                open={open}
                onClose={onClose}
                TransitionComponent={Transition}
          >
              <AppBar sx={{position: 'relative'}}>
                  <Toolbar>
                      <IconButton
                            edge="start"
                            color="inherit"
                            onClick={onClose}
                            aria-label="close"
                      >
                          <IoMdClose/>
                      </IconButton>
                      <Typography sx={{ml: 2, flex: 1}} variant="h6" component="div">
                          {previewMode ? "Preview Your Signature" : "Draw Your Signature"}
                      </Typography>
                  </Toolbar>
              </AppBar>
              <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: '100%',
                        p: 2,
                        bgcolor: '#fff',
                        width: '100%',
                        maxWidth: 800,
                        margin: 'auto',
                    }}
              >
                  {previewMode ? (
                        <Box display="flex" flexDirection="column" alignItems="center">
                            <img
                                  src={signatureUrl}
                                  alt="Preview Signature"
                                  style={{
                                      width: '100%',
                                      maxWidth: 600,
                                      height: 'auto'
                                  }}
                            />
                            <Box sx={{display: 'flex', mt: 2}}>
                                <Button onClick={handleRetry} variant="contained" sx={{mr: 2}}>
                                    Retry
                                </Button>
                                <Button onClick={handleUploadSignature} variant="contained">
                                    Save Signature
                                </Button>
                            </Box>
                        </Box>
                  ) : (
                        <>
                            <SignatureCanvas
                                  penColor="black"
                                  canvasProps={{
                                      width: window.innerWidth > 600 ? 600 : window.innerWidth - 40,
                                      height: 200,
                                      className: 'sigCanvas',
                                      style: {border: '2px solid #000'},
                                  }}
                                  ref={sigCanvas}
                                  clearOnResize={false}
                            />
                            <Box sx={{mt: 2, display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                                <Button variant="outlined" onClick={handleClearCanvas} sx={{mr: 1}}>
                                    Clear
                                </Button>
                                <Button onClick={handleSaveSignature} variant="contained">
                                    Preview Signature
                                </Button>
                            </Box>
                        </>
                  )}
              </Box>
          </Dialog>
    );
};

export default SignatureDialog;
