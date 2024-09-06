"use client";
import React, {useState, useEffect} from 'react';
import {
    Box,
    Card,
    CardContent,
    Container,
    Grid,
    Typography,
    Alert,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from '@mui/material';
import {FaChevronDown, FaCheckCircle, FaTimesCircle} from 'react-icons/fa';
import dayjs from 'dayjs';
import RangeDateComponent from '@/app/UiComponents/FormComponents/MUIInputs/RangeDateComponent';
import DateComponent from '@/app/UiComponents/FormComponents/MUIInputs/DateChangerComponent';
import FullScreenLoader from "@/app/UiComponents/Feedback/FullscreenLoader";

const AttendanceHistory = ({userId}) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const now = dayjs();
    const firstDayOfMonth = now.startOf('month').format('YYYY-MM-DD');
    const lastDayOfMonth = now.endOf('month').format('YYYY-MM-DD');
    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(lastDayOfMonth);
    const [filters, setFilters] = useState({startDate: firstDayOfMonth, endDate: lastDayOfMonth});
    const [date, setDate] = useState(null);

    const updateFilters = (newFilters) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            ...newFilters,
        }));
        setLoading(true); // Show loading spinner when filters change
    };

    const handleDateChange = (newDate) => {
        if (loading) return;

        setDate(newDate ? dayjs(newDate).format('YYYY-MM-DD') : null);
        updateFilters({date: newDate ? dayjs(newDate).format('YYYY-MM-DD') : null, startDate: null, endDate: null});
    };

    const handleStartDateChange = (newDate) => {
        if (loading) return;
        setStartDate(newDate);
        updateFilters({startDate: newDate ? dayjs(newDate).format('YYYY-MM-DD') : null, date: null});
    };

    const handleEndDateChange = (newDate) => {
        if (loading) return;

        setEndDate(newDate);
        updateFilters({endDate: newDate ? dayjs(newDate).format('YYYY-MM-DD') : null, date: null});
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`/api/employee/private/${userId}/attendance?filters=${JSON.stringify(filters)}`);
                if (response.ok) {
                    const res = await response.json();
                    setData(res.data);
                    setError("")
                } else {
                    setError('Failed to fetch attendance data. Please try again later.');
                }
            } catch (error) {
                console.error('Failed to fetch attendance data:', error);
                console.log(error, "error in AttendanceHistory")

                setError('An unexpected error occurred. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userId, filters]);


    return (
          <Container>

              {loading && <FullScreenLoader/>}
              <Typography variant="h4" gutterBottom>
                  Attendance History
              </Typography>
              <Box
                    sx={{
                        display: 'flex',
                        gap: 2,
                        mb: 3,
                        p: 2,
                        justifyContent: "space-between",
                        flexDirection: {
                            xs: "column",
                            sm: "column",
                            md: "row",
                        }
                    }}
              >
                  <RangeDateComponent
                        startDate={startDate}
                        endDate={endDate}
                        handleStartDateChange={handleStartDateChange}
                        handleEndDateChange={handleEndDateChange}
                  />
                  <DateComponent date={date} handleDateChange={handleDateChange} label="Select a day"/>
              </Box>
              {!loading && (!data || data.length === 0) ?
                    <Typography variant="h6">No attendance data available.</Typography> : null}
              {error && <Alert severity="error">{error}</Alert>}
              <Grid container spacing={3}>
                  {data?.map((dayAttendance) => (
                        <Grid item xs={12} key={dayAttendance.id}>
                            <Card>
                                <CardContent>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <Typography variant="h6">
                                                Date: {new Date(dayAttendance.date).toLocaleDateString()}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography>
                                                Total Reward: {dayAttendance.totalReward || 'N/A'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography>
                                                Exam Type: {dayAttendance.examType || 'N/A'}
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={6}>
                                            <Typography className={"flex items-center gap-2"}>
                                                Paid: {dayAttendance.isPaid ? <FaCheckCircle color="green"/> :
                                                  <FaTimesCircle color="red"/>}
                                            </Typography>
                                        </Grid>
                                    </Grid>

                                    <Accordion sx={{mt: 3}} defaultExpanded>
                                        <AccordionSummary expandIcon={<FaChevronDown/>}>
                                            <Typography> Shifts</Typography>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Box display="grid" gridTemplateColumns={{xs: '1fr', md: '1fr 1fr'}}
                                                 gap={2}>
                                                <Box>
                                                    <Typography variant="subtitle1" mt={2}>
                                                        Attended Shifts:
                                                    </Typography>
                                                    {dayAttendance.attendances && dayAttendance.attendances.length > 0 ? (
                                                          <TableContainer component={Paper}>
                                                              <Table>
                                                                  <TableHead>
                                                                      <TableRow>
                                                                          <TableCell>Shift</TableCell>
                                                                          <TableCell>Duration (hours)</TableCell>
                                                                          <TableCell>Reward</TableCell>
                                                                      </TableRow>
                                                                  </TableHead>
                                                                  <TableBody>
                                                                      {dayAttendance.attendances.map((attendance) => (
                                                                            <TableRow key={attendance.id}>
                                                                                <TableCell>{attendance.shift.name}</TableCell>
                                                                                <TableCell>{attendance.shift.duration}</TableCell>
                                                                                <TableCell>{attendance.dutyRewards.reduce((acc, reward) => acc + reward.amount, 0)}</TableCell>
                                                                            </TableRow>
                                                                      ))}
                                                                  </TableBody>
                                                              </Table>
                                                          </TableContainer>
                                                    ) : (
                                                          <Typography>No attended shifts</Typography>
                                                    )}
                                                </Box>
                                                <Box>
                                                    <Typography variant="subtitle1" mt={2}>
                                                        Non-Attended Shifts:
                                                    </Typography>
                                                    {dayAttendance.nonAttendedShifts && dayAttendance.nonAttendedShifts.length > 0 ? (
                                                          <TableContainer component={Paper}>
                                                              <Table>
                                                                  <TableHead>
                                                                      <TableRow>
                                                                          <TableCell>Shift</TableCell>
                                                                          <TableCell>Duration (hours)</TableCell>
                                                                      </TableRow>
                                                                  </TableHead>
                                                                  <TableBody>
                                                                      {dayAttendance.nonAttendedShifts.map((shift) => (
                                                                            <TableRow key={shift.id}>
                                                                                <TableCell>{shift.name}</TableCell>
                                                                                <TableCell>{shift.duration}</TableCell>
                                                                            </TableRow>
                                                                      ))}
                                                                  </TableBody>
                                                              </Table>
                                                          </TableContainer>
                                                    ) : (
                                                          <Typography>No non-attended shifts</Typography>
                                                    )}
                                                </Box>
                                            </Box>
                                        </AccordionDetails>
                                    </Accordion>
                                </CardContent>
                            </Card>
                        </Grid>
                  ))}
              </Grid>
          </Container>
    );
};

export default AttendanceHistory;
