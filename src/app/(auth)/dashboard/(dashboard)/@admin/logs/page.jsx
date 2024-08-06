'use client';
import React, {useState, useEffect} from 'react';
import {Box, Typography, Paper} from '@mui/material';
import {styled} from '@mui/material/styles';
import axios from 'axios';
import parse from 'html-react-parser';
import dayjs from 'dayjs';
import RangeDateComponent from "@/app/UiComponents/FormComponents/MUIInputs/RangeDateComponent";
import DateComponent from "@/app/UiComponents/FormComponents/MUIInputs/DateChangerComponent";
import FullScreenLoader from "@/app/UiComponents/Feedback/FullscreenLoader";

const LogContainer = styled(Box)(({theme}) => ({
    padding: theme.spacing(3),
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    maxWidth: 800,
    margin: '20px auto',
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[1],
}));

const LogCard = styled(Paper)(({theme}) => ({
    margin: theme.spacing(2, 0),
    padding: theme.spacing(2),
    borderLeft: `5px solid ${theme.palette.primary.main}`,
    borderRadius: theme.shape.borderRadius,
    boxShadow: theme.shadows[2],
    backgroundColor: theme.palette.background.paper,
}));

const LogTitle = styled(Typography)(({theme}) => ({
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
    color: theme.palette.primary.main,
}));

const LogDescription = styled(Typography)(({theme}) => ({
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
}));

const LogDate = styled(Typography)(({theme}) => ({
    color: theme.palette.text.disabled,
    fontSize: 12,
}));

const LogList = () => {
    const now = dayjs();
    const firstDayOfMonth = now.startOf('month').format('YYYY-MM-DD');
    const lastDayOfMonth = now.endOf('month').format('YYYY-MM-DD');

    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(lastDayOfMonth);
    const [date, setDate] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchLogs = async (filters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters);
            const response = await axios.get(`/api/admin/logs?${params.toString()}`);
            setLogs(response.data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateChange = (newDate) => {
        setDate(newDate ? dayjs(newDate).format('YYYY-MM-DD') : null);
        updateFilters({date: newDate ? dayjs(newDate).format('YYYY-MM-DD') : null, startDate: null, endDate: null});
    };

    const handleStartDateChange = (newDate) => {
        setStartDate(newDate ? dayjs(newDate).format('YYYY-MM-DD') : null);
        updateFilters({startDate: newDate ? dayjs(newDate).format('YYYY-MM-DD') : null, date: null});
    };

    const handleEndDateChange = (newDate) => {
        setEndDate(newDate ? dayjs(newDate).format('YYYY-MM-DD') : null);
        updateFilters({endDate: newDate ? dayjs(newDate).format('YYYY-MM-DD') : null, date: null});
    };

    const updateFilters = (newFilters) => {
        fetchLogs({...newFilters, page: 1, limit: 10});
    };

    useEffect(() => {
        fetchLogs({startDate, endDate, page: 1, limit: 10});
    }, [startDate, endDate]);

    return (
          <>
              {loading && <FullScreenLoader/>}
              <LogContainer>
                  <RangeDateComponent
                        startDate={startDate}
                        endDate={endDate}
                        handleStartDateChange={handleStartDateChange}
                        handleEndDateChange={handleEndDateChange}
                  />
                  <DateComponent date={date} handleDateChange={handleDateChange} label="Select a day"/>
                  {logs.map((log) => (
                        <LogCard key={log.id}>
                            <LogTitle variant="h6">{log.action}</LogTitle>
                            <LogDescription variant="body2">{parse(log.description)}</LogDescription>
                            <LogDate variant="caption">{new Date(log.createdAt).toLocaleString()}</LogDate>
                        </LogCard>
                  ))}
              </LogContainer>
          </>
    );
};

export default LogList;
