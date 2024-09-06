"use client";
import React, {useState, useEffect} from "react";
import {Box, Container, Grid, Typography, CircularProgress} from "@mui/material";
import {useRouter, useSearchParams} from "next/navigation";
import {Bar} from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';

import FilterSelect from "@/app/UiComponents/FormComponents/FilterSelect";
import DateFilterComponent from "@/app/UiComponents/FormComponents/DateFilterComponent";

// Register chart elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

// Fetch data function
const fetchData = async (url) => {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error("Network response was not ok");
    }
    return response.json();
};

// Card component for displaying totals
const CardComponent = ({title, value, loading}) => (
      <Box boxShadow={3} p={3} borderRadius={2} bgcolor="#f5f5f5">
          <Typography variant="h6" gutterBottom fontWeight="bold" color="secondary">
              {title}
          </Typography>
          {loading ? (
                <CircularProgress/>
          ) : (
                <Typography variant="h5" fontWeight="medium">
                    {value}
                </Typography>
          )}
      </Box>
);

// Bar chart component to visualize income and outcome
const BarChartComponent = ({data, loading, title}) => {
    const options = {
        plugins: {
            datalabels: {
                anchor: 'end',
                align: 'top',
                formatter: (value, context) => {
                    const label = context.chart.data.labels[context.dataIndex];
                    return `${label}: ${value}`;
                },
                font: {
                    weight: 'bold',
                    size: 14,
                },
                color: 'black',
            },
        },
        scales: {
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
          <Box position="relative" p={2} boxShadow={3} borderRadius={2} bgcolor="#fff" minHeight={300} maxHeight={400}>
              {loading && (
                    <Box position="absolute" top={0} left={0} right={0} bottom={0} display="flex" alignItems="center"
                         justifyContent="center" bgcolor="rgba(255, 255, 255, 0.7)" zIndex={2}>
                        <CircularProgress/>
                    </Box>
              )}
              <Typography variant="h6" gutterBottom>
                  {title}
              </Typography>
              <Bar data={data} options={options}/>
          </Box>
    );
};

const StudentsAttendanceDashboard = () => {
    const [totalIncome, setTotalIncome] = useState(null);
    const [totalOutcome, setTotalOutcome] = useState(null);
    const [totalAttendance, setTotalAttendance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [centers, setCenters] = useState([]);
    const [centerLoading, setCenterLoading] = useState(true);
    const searchParams = useSearchParams();
    const selectedCenter = searchParams.get("centerId");
    const router = useRouter();
    const [filters, setFilters] = useState()
    // Fetch center data
    const fetchCenters = async () => {
        setCenterLoading(true);
        const response = await fetch("/api/index?id=center");  // Replace with your actual API endpoint
        const result = await response.json();
        setCenters(result.data || []);
        setCenterLoading(false);
    };

    useEffect(() => {
        fetchCenters();
    }, []);

    const handleCenterChange = (event) => {
        const centerId = event.target.value;
        const params = new URLSearchParams(searchParams);
        if (centerId) {
            params.set("centerId", centerId);
        } else {
            params.delete("centerId");
        }
        router.push(`?${params.toString()}`);
    };

    // Handle date filter changes


    // Fetch data based on filters
    const fetchDataFromFilters = async (filters) => {
        setLoading(true);
        let url = `/api/admin/dashboard/students?`;
        if (filters) {
            if (filters.date) {
                url += `date=${filters.date}&`;
            } else if (filters.startDate && filters.endDate) {
                url += `startDate=${filters.startDate}&endDate=${filters.endDate}&`;
            }
        }
        if (selectedCenter) {
            url += `centerId=${selectedCenter}&`;
        }

        try {
            const data = await fetchData(url);
            setTotalIncome(data.totalIncome);
            setTotalOutcome(data.totalOutcome);
            setTotalAttendance(data.totalStudentAttendance);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDataFromFilters(filters);
    }, [selectedCenter, filters]);

    // Prepare chart data for income vs outcome comparison
    const incomeOutcomeChartData = {
        labels: ["Total Income", "Total Outcome"],
        datasets: [
            {
                label: "Income vs Outcome",
                data: [totalIncome, totalOutcome],
                backgroundColor: ["#4BC0C0", "#FF6384"],
            },
        ],
    };

    return (
          <Container>
              <Typography variant="h4" gutterBottom fontWeight="bold" color="primary" mt={2}>
                  Students Attendance Dashboard
              </Typography>
              <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                      <DateFilterComponent
                            setFilters={setFilters}
                            filters={filters}
                      />
                  </Grid>
                  <Grid item xs={12} md={4}>
                      <FilterSelect
                            options={centers}
                            label={"Centers"}
                            onChange={handleCenterChange}
                            loading={centerLoading}
                            value={selectedCenter}
                      />
                  </Grid>
                  <Grid item xs={12} md={4}>
                      <CardComponent title="Total Attendance" value={totalAttendance} loading={loading}/>
                  </Grid>
                  <Grid item xs={12} md={4}>
                      <CardComponent title="Total Income" value={totalIncome} loading={loading}/>
                  </Grid>
                  <Grid item xs={12} md={4}>
                      <CardComponent title="Total Outcome" value={totalOutcome} loading={loading}/>
                  </Grid>
                  <Grid item xs={12}>
                      <BarChartComponent data={incomeOutcomeChartData} loading={loading} title="Income vs Outcome"/>
                  </Grid>
              </Grid>
          </Container>
    );
};

export default StudentsAttendanceDashboard;
