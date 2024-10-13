"use client"
import React, {useEffect, useState} from "react";
import {Alert, Box, CircularProgress, Paper, Typography} from "@mui/material";

export default function RegisterOpenChecker({children}) {
    const [loading, setLoading] = useState(true);
    const [isOpen, setIsOpen] = useState("CLOSED");

    const fetchData = async () => {
        setLoading(true);
        const response = await fetch(`/api/employee/pages-control?_=${new Date().getTime()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                page: "REGISTER"
            })
        });
        const res = await response.json()
        console.log(res, "res")
        if (res?.data) {
            setIsOpen(res.data.status || 'CLOSED');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);


    if (loading) {
        return (
              <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                  <CircularProgress/>
              </Box>
        );
    }


    return (
          <div className={"py-20 w-full bg-bgPrimary"}>
              {isOpen === "OPEN" ? (
                    <Box width="100%">
                        {children}
                    </Box>
              ) : (
                    <div className={"flex justify-center"}>
                        <Paper elevation={3}
                               sx={{p: {xs: 1.5, md: 4}, textAlign: 'center', width: "fit-content", mx: "6px"}}>
                            <Alert severity="info" sx={{justifyContent: "center", maxWidth: 700, mx: "auto"}}>
                                <Typography variant="h6" gutterBottom>
                                    Registration is currently closed and will reopen soon.
                                </Typography>
                                <Typography variant="body1" gutterBottom>
                                    Please coordinate with the center supervisor for further details.
                                </Typography>
                            </Alert>
                        </Paper>
                    </div>
              )}
          </div>
    );
}
