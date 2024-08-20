import React, {useState} from 'react';
import {Box, Button, Typography} from '@mui/material';
import SignatureDialog from "@/app/UiComponents/Models/SignatureDialog";

const SignatureComponent = ({user}) => {
    const [signatureUrl, setSignatureUrl] = useState(user.signature || null);
    const [openDialog, setOpenDialog] = useState(false);

    const handleOpenDialog = () => {
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
    };

    const handleSignatureSaved = (newSignatureUrl) => {
        setSignatureUrl(newSignatureUrl);
    };

    return (
          <Box display="flex" alignItems="center" gap={4}>
              {signatureUrl ? (
                    <>
                        <Typography variant="subtitle1" color="textSecondary"
                                    className={"w-[20%] md:w-[25%]"}
                        >
                            Signature
                        </Typography>
                        <div className={"flex-1"}>

                            <img
                                  src={signatureUrl}
                                  alt="User Signature"
                                  style={{
                                      width: '100%',
                                      height: 'auto',
                                  }}
                            />
                        </div>
                    </>
              ) : (
                    <Button onClick={handleOpenDialog} variant="outlined">
                        Add Your Signature
                    </Button>
              )}

              <SignatureDialog
                    user={user}
                    open={openDialog}
                    onClose={handleCloseDialog}
                    onSignatureSaved={handleSignatureSaved}
              />
          </Box>
    );
};

export default SignatureComponent;
