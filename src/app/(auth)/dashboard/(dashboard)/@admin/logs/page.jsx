'use client';
import React, {useState, useEffect} from 'react';
import {Box, Typography, Paper} from '@mui/material';
import {styled} from '@mui/material/styles';
import axios from 'axios';
import parse from 'html-react-parser';

import FullScreenLoader from "@/app/UiComponents/Feedback/FullscreenLoader";
import DateFilterComponent from "@/app/UiComponents/FormComponents/DateFilterComponent";
import dayjs from "dayjs";

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

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({})
    const fetchLogs = async () => {
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

    useEffect(() => {
        fetchLogs({...filters, page: 1, limit: 10});
    }, [filters]);

    return (
          <>
              {loading && <FullScreenLoader/>}
              <LogContainer>
                  <DateFilterComponent
                        setFilters={setFilters}
                        filters={filters}
                  />
                  {logs.map((log) => (
                        <LogCard key={log.id}>
                            <LogTitle variant="h6">{log.action}</LogTitle>
                            <LogDescription variant="body2">{parse(log.description)}</LogDescription>
                            <LogDate variant="caption">{dayjs(log.createdAt).format("YYYY-MM-DD")}</LogDate>
                        </LogCard>
                  ))}
              </LogContainer>
          </>
    );
};

export default LogList;
