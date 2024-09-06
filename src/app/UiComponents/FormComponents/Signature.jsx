import React, {useState} from 'react';
import {Box, Button, Typography} from '@mui/material';
import SignatureDialog from "@/app/UiComponents/Models/SignatureDialog";
import Image from "next/image";

const SignatureComponent = ({user, setUser}) => {
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
        if (setUser) {
            setUser((old) => ({...old, signature: newSignatureUrl}))
        }
    };

    return (
          <Box display="flex" alignItems="center" gap={4}>
              {signatureUrl ? (
                    <>
                        <Typography variant="subtitle1" color="secondary"
                                    className={"w-[20%] md:w-[25%]"}
                        >
                            Signature
                        </Typography>
                        <div className={"flex-1"}>
                            <Image
                                  src={signatureUrl}
                                  alt="User Signature"
                                  className={"w-full h-auto max-w-[200px] min-h-[50px]"}
                                  width={200} height={100}
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
