"use client"
import React, {useState, useEffect} from 'react';
import {Box, Container, Grid, Typography, Button, Card, CardContent} from '@mui/material';
import axios from "axios";
import FilterSelect from "@/app/UiComponents/FormComponents/FilterSelect";
import FullScreenLoader from "@/app/UiComponents/Feedback/FullscreenLoader";
import RangeDateComponent from "@/app/UiComponents/FormComponents/MUIInputs/RangeDateComponent";
import dayjs from "dayjs";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";

const Dashboard = () => {
    const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(dayjs().endOf('month').format('YYYY-MM-DD'));
    const [centerId, setCenterId] = useState('');
    const [centers, setCenters] = useState([]);
    const [dates, setDates] = useState([]);
    const [loadingDates, setLoadingDates] = useState(false);
    const {setLoading} = useToastContext()
    useEffect(() => {
        // Fetch centers for selection
        axios.get('/api/index?id=center').then((response) => {
            setCenters(response.data.data);
        });
    }, []);
    console.log(dates, "dates")
    const handleFetchDates = () => {
        setLoadingDates(true);
        axios.get(`/api/finincal?startDate=${startDate}&endDate=${endDate}&centerId=${centerId}`)
              .then((response) => {
                  // Ensure we correctly access the dates data from the response
                  setDates(response.data.data || []);
                  setLoadingDates(false);
              })
              .catch((error) => {
                  console.error('Error fetching dates:', error);
                  setLoadingDates(false);
              });
    };

    const handleMarkAsPaid = async (date) => {
        const res = await handleRequestSubmit(date, setLoading, "/finincal?centerId=" + centerId, false, "Updating", false, "POST")
        if (res.status === 200) {
            setDates(dates.filter(d => d !== date));
        }
    };

    return (
          <Container>
              {loadingDates && <FullScreenLoader/>}
              <Typography variant="h4" color="primary" p={2}>Unpaid Day Attendances</Typography>
              <div className={"flex items-center justify-between md:flex-row flex-col w-full"}>

                  <div className={"w-full mt-[16px]"}>

                      <RangeDateComponent
                            handleEndDateChange={setEndDate}
                            handleStartDateChange={setStartDate}
                            endDate={endDate}
                            startDate={startDate}
                      />
                  </div>

                  <FilterSelect
                        label="Center"
                        options={centers}
                        value={centerId}
                        onChange={(e) => setCenterId(e.target.value)}
                        loading={loadingDates}
                  />
              </div>
              <div className={"flex justify-center mb-5"}>

                  <Button variant="contained" color="primary" mx={"auto"} onClick={handleFetchDates}>
                      Fetch Unpaid Dates
                  </Button>
              </div>
              <Grid container spacing={3}>
                  {dates?.length > 0 ? (
                        dates.map((date) => (
                              <Grid item xs={12} sm={6} md={4} lg={3} key={date}>
                                  <Card>
                                      <CardContent>
                                          <Typography mb={2} variant="h6">{new Date(date).toDateString()}</Typography>
                                          <Button variant="contained" color="secondary"
                                                  onClick={() => handleMarkAsPaid(date)} fullWidth>
                                              Mark as Paid
                                          </Button>
                                      </CardContent>
                                  </Card>
                              </Grid>
                        ))
                  ) : (
                        <Grid item xs={12}>
                            <Typography variant="body1">No unpaid day attendances found for the selected date range and
                                center.</Typography>
                        </Grid>
                  )}
              </Grid>
          </Container>
    );
};

export default Dashboard;
