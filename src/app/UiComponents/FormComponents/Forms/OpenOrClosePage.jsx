'use client';

import React, {useEffect, useState} from 'react';
import {Typography, Card, Box, CircularProgress, Switch, FormControlLabel, Alert} from '@mui/material';
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {getData} from "@/helpers/functions/getData";
import {useToastContext} from "@/providers/ToastLoadingProvider";

const PageControlForm = () => {
    const [status, setStatus] = useState('CLOSED');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const {setLoading: setSubmitting} = useToastContext();

    // Fetch current data on mount
    const fetchData = async () => {
        setLoading(true);
        const res = await getData({url: `/admin/pages-control`, setLoading});
        if (res?.data) {
            setStatus(res.data.status || 'CLOSED');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleStatusChange = async (event) => {
        const newStatus = event.target.checked ? 'OPEN' : 'CLOSED';
        const body = {status: newStatus};
        const response = await handleRequestSubmit(body, setSubmitting, `admin/pages-control`, null, 'Updating');
        if (response.status !== 200) {
            setError(response.message);
        } else {
            setStatus(newStatus); // Update the status on success
        }
    };

    return (
          <Card sx={{padding: {xs: 1, md: 1.5}, maxWidth: 600, margin: '0 auto'}}>
              <Box>
                  <Typography variant="body1" display="flex" alignItems="center">
                      <strong>Registration Status:</strong>
                      <FormControlLabel
                            control={
                                <Switch
                                      checked={status === 'OPEN'}
                                      onChange={handleStatusChange}
                                      color="primary"
                                      disabled={setSubmitting} // Disable switch while processing
                                />
                            }
                            disabled={loading}
                            label={loading ? <CircularProgress/> : status === 'OPEN' ? 'Open' : 'Closed'}
                            labelPlacement="start"
                            sx={{
                                marginLeft: 1,
                                "&:hover": {cursor: "pointer"} // Add hover effect to change cursor
                            }}/>
                  </Typography>

                  {error && (
                        <Box sx={{mt: 2}}>
                            <Alert severity="error">{error}</Alert>
                        </Box>
                  )}
              </Box>

          </Card>
    );
};

export default PageControlForm;
