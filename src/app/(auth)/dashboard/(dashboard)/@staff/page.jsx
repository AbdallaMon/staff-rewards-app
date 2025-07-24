"use client";
import React, {useState, useEffect} from 'react';
import {Box, Container, Grid, Typography, CircularProgress} from '@mui/material';
import {useSelector} from 'react-redux';
import {AttendancesChart} from '@/app/UiComponents/DataViewer/ChartWrapper';
import {RewardsChart} from '@/app/UiComponents/DataViewer/ChartWrapper';
import DateFilterComponent from "@/app/UiComponents/FormComponents/DateFilterComponent";

const Dashboard = () => {
    const user = useSelector((state) => state.auth);
    const userId = user.data.id;
    const [totalRewards, setTotalRewards] = useState(null);
    const [totalShifts, setTotalShifts] = useState(null);
    const [totalHours, setTotalHours] = useState(null);
    const [totalDays, setTotalDays] = useState(null);
    const [loadingRewards, setLoadingRewards] = useState(true);
    const [loadingShifts, setLoadingShifts] = useState(true);
    const [loadingHours, setLoadingHours] = useState(true);
    const [loadingDays, setLoadingDays] = useState(true);
    const [filters, setFilters] = useState();
    useEffect(() => {
        let url = `/api/employee/private/${userId}/dashboard?`
        if (filters) {
            if (filters.date) {
                url += `date=${filters.date}&`;
            } else if (filters.startDate && filters.endDate) {
                url += `startDate=${filters.startDate}&endDate=${filters.endDate}&`;
            }
        }
        setLoadingRewards(true)
        setLoadingShifts(true);
        setLoadingHours(true);
        setLoadingDays(true);

        fetch(`${url}totalRewards=true`)
              .then((response) => response.json())
              .then((data) => {
                  setTotalRewards(data.totalRewards);
                  setLoadingRewards(false);
              })
              .catch((error) => {
                  console.error('Error fetching rewards data:', error);
                  setLoadingRewards(false);
              });

        fetch(`${url}totalShifts=true`)
              .then((response) => response.json())
              .then((data) => {
                  setTotalShifts(data.totalShifts);
                  setLoadingShifts(false);
              })
              .catch((error) => {
                  console.error('Error fetching shifts data:', error);
                  setLoadingShifts(false);
              });

        fetch(`${url}totalHours=true`)
              .then((response) => response.json())
              .then((data) => {
                  setTotalHours(data.totalHours);
                  setLoadingHours(false);
              })
              .catch((error) => {
                  console.error('Error fetching hours data:', error);
                  setLoadingHours(false);
              });

        fetch(`${url}totalDays=true`)
              .then((response) => response.json())
              .then((data) => {
                  setTotalDays(data.totalDays);
                  setLoadingDays(false);
              })
              .catch((error) => {
                  console.error('Error fetching days data:', error);
                  setLoadingDays(false);
              });
    }, [userId, filters]);

    return (
          <Container>
              <Grid container spacing={3} sx={{mt: 3}}>
                  <Grid item xs={12} md={4}>
                      <Typography variant="h4" gutterBottom fontWeight="bold" color="primary">Employee
                          Dashboard</Typography>
                  </Grid>
                  <Grid item xs={12} md={8}>
                      <Box display="flex" alignItems="center" justifyContent="flex-end" mb={2}>
                          <DateFilterComponent
                                setFilters={setFilters}
                                filters={filters}
                          />
                      </Box>
                  </Grid>
              </Grid>
              <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                      <Box boxShadow={3} p={3} borderRadius={2} bgcolor="#f5f5f5">
                          <Typography variant="h6" gutterBottom fontWeight="bold" color="secondary">Total Attendance
                              Rating</Typography>
                          <Typography variant="h5" fontWeight="medium">
                              {user?.data?.totalRating ? user.data.totalRating + "%" : "N/A"}
                          </Typography>
                      </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                      <Box boxShadow={3} p={3} borderRadius={2} bgcolor="#f5f5f5">
                          <Typography variant="h6" gutterBottom fontWeight="bold" color="secondary">Total
                              Rewards </Typography>
                          {loadingRewards ? (
                                <CircularProgress/>
                          ) : (
                                <Typography variant="h5" fontWeight="medium">{totalRewards}</Typography>
                          )}
                      </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                      <Box boxShadow={3} p={3} borderRadius={2} bgcolor="#f5f5f5">
                          <Typography variant="h6" gutterBottom fontWeight="bold" color="secondary">Total Attended
                              Shifts </Typography>
                          {loadingShifts ? (
                                <CircularProgress/>
                          ) : (
                                <Typography variant="h5" fontWeight="medium">{totalShifts}</Typography>
                          )}
                      </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                      <Box boxShadow={3} p={3} borderRadius={2} bgcolor="#f5f5f5">
                          <Typography variant="h6" gutterBottom fontWeight="bold" color="secondary">Total Hours Attended
                          </Typography>
                          {loadingHours ? (
                                <CircularProgress/>
                          ) : (
                                <Typography variant="h5" fontWeight="medium">{totalHours} hours</Typography>
                          )}
                      </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>

                      <Box boxShadow={3} p={3} borderRadius={2} bgcolor="#f5f5f5">
                          <Typography variant="h6" gutterBottom fontWeight="bold" color="secondary">Total Days Attended
                          </Typography>
                          {loadingDays ? (
                                <CircularProgress/>
                          ) : (
                                <Typography variant="h5" fontWeight="medium">{totalDays} days</Typography>
                          )}
                      </Box>
                  </Grid>
                  <Grid item xs={12} md={6}>
                  </Grid>
                  <Grid item xs={12} md={6}>
                      <AttendancesChart userId={userId} filters={filters}/>
                  </Grid>
                  <Grid item xs={12} md={6}>
                      <RewardsChart userId={userId} filters={filters}/>
                  </Grid>
              </Grid>
          </Container>
    );
};

export default Dashboard;
