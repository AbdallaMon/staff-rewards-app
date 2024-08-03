import React, {useState, useEffect} from 'react';
import {Box, CircularProgress, Typography} from '@mui/material';
import {Bar} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
      CategoryScale,
      LinearScale,
      BarElement,
      Title,
      Tooltip,
      Legend,
      ArcElement
);

const fetchData = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};

const ChartWrapper = ({children, loading}) => (
      <Box position="relative" p={2} boxShadow={3} borderRadius={2} bgcolor="#fff" minHeight={300} maxHeight={400}
           maxWidth={"100%"}>
          {loading && (
                <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      bgcolor="rgba(255, 255, 255, 0.7)"
                      zIndex={2}
                >
                    <CircularProgress/>
                </Box>
          )}
          {children}
      </Box>
);

export const AttendancesChart = ({userId}) => {
    const [data, setData] = useState({labels: ['Paid', 'Not Paid'], datasets: []});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData(`/api/employee/private/${userId}/dashboard?paidDayAttendances=true`)
              .then((data) => {
                  setData({
                      labels: ['Paid', 'Not Paid'],
                      datasets: [{
                          label: 'Attendances',
                          data: [data.paidDayAttendances.paid, data.paidDayAttendances.notPaid],
                          backgroundColor: ['#4BC0C0', '#FF6384'],
                      }]
                  });
                  setLoading(false);
              })
              .catch((error) => {
                  console.error('Error fetching attendances data:', error);
                  setLoading(false);
              });
    }, [userId]);

    return (
          <ChartWrapper loading={loading}>
              <Typography variant="h6" gutterBottom>Attendances Summary this year</Typography>
              <Bar data={data}/>
          </ChartWrapper>
    );
};
