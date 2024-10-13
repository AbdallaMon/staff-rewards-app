"use client"

import {Alert, AlertTitle, Box, Button, Typography} from '@mui/material';
import CommitmentPdf from "@/app/UiComponents/Templatese/CommitmentPdf";
import SignatureComponent from "@/app/UiComponents/FormComponents/Signature";
import React, {useEffect, useState} from "react";
import FullScreenLoader from "@/app/UiComponents/Feedback/FullscreenLoader";
import {useDispatch, useSelector} from "react-redux";
import handleAuthState from "@/helpers/functions/handleAuthState";

export default function Layout({children}) {
    let {data} = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState(null)

    useEffect(() => {
        if (data) {
            async function baseUserSignature() {
                setLoading(true)
                const request = await fetch(`/api/employee/private/${data.id}/base4?signature=${data.signature}`)
                const response = await request.json()
                setUser({...data, signature: response.signature})
                setLoading(false)
            }

            if (data.signature && !data.commitment) {
                baseUserSignature()
            } else {
                setLoading(true)
                setUser(data)
                setLoading(false)
            }
        }
    }, [data])
    if (loading) return <FullScreenLoader/>
    if (user.commitment) return children
    return <CommitmentApprove setUser={setUser} user={user}/>
}

function CommitmentApprove({user, setUser}) {
    return (
          <Box sx={{p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <Alert severity="warning" sx={{mb: 3, maxWidth: 600}}>
                  <AlertTitle>Important</AlertTitle>
                  You need to upload your <strong>commitment</strong> and <strong>signature</strong> to access the
                  dashboard.
              </Alert>
              {user.signature ? (
                    <Box sx={{mt: 3, maxWidth: 600, width: '100%'}}>
                        <Typography variant="h6" gutterBottom>
                            Review and Approve Your Commitment
                        </Typography>
                        <CommitmentPdf user={user} setUser={setUser} get={true}/>
                        <Typography variant="body2" color="textSecondary" sx={{mt: 1}}>
                            Make sure all the information is accurate before submitting.
                        </Typography>
                    </Box>
              ) : (
                    <Box sx={{mt: 2}}>
                        <Typography variant="body1" color="textPrimary">
                            Please upload your signature to proceed with generating your commitment document.
                        </Typography>
                        <SignatureComponent user={user} setUser={setUser}/>
                    </Box>
              )}
          </Box>
    );
}