"use client";
import React, {useState, useEffect} from "react";
import {
    Box,
    Container,
    Grid,
    Typography,
    CircularProgress,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper
} from "@mui/material";
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
import Link from "next/link";

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

    const [centerData, setCenterData] = useState([]);
    const [loadingFinancial, setLoadingFinancial] = useState(true);
    const [loadingAttendance, setLoadingAttendance] = useState(true);
    const [centers, setCenters] = useState([]);
    const [examType, setExamType] = useState("");
    const [centerLoading, setCenterLoading] = useState(true);
    const searchParams = useSearchParams();
    const selectedCenter = searchParams.get("centerId");
    const router = useRouter();
    const [filters, setFilters] = useState();

    const fetchCenters = async () => {
        setCenterLoading(true);
        const response = await fetch("/api/index?id=center");
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

    const handleExamTypeChange = (event) => {
        const examType = event.target.value;
        const params = new URLSearchParams(searchParams);
        params.set("examType", examType);
        router.push(`?${params.toString()}`);
        setExamType(examType); // Update local state
    };

    const fetchFinancialData = async (filters) => {
        setLoadingFinancial(true);
        let financialUrl = `/api/admin/dashboard/students?`;

        if (filters) {
            if (filters.date) {
                financialUrl += `date=${filters.date}&`;
            } else if (filters.startDate && filters.endDate) {
                financialUrl += `startDate=${filters.startDate}&endDate=${filters.endDate}&`;
            }
        }

        if (selectedCenter) {
            financialUrl += `centerId=${selectedCenter}&`;
        }

        if (examType) {
            financialUrl += `examType=${examType}&`; // Include exam type
        }

        try {
            const data = await fetchData(financialUrl);
            setTotalIncome(data.totalIncome);
            setTotalOutcome(data.totalOutcome);
            setTotalAttendance(data.totalStudentAttendance);
            setLoadingFinancial(false);
        } catch (error) {
            console.error("Error fetching financial data:", error);
            setLoadingFinancial(false);
        }
    };

    const fetchAttendanceData = async (filters) => {
        setLoadingAttendance(true);
        let attendanceUrl = `/api/admin/dashboard/students?type=attendance&`;

        if (filters) {
            if (filters.date) {
                attendanceUrl += `date=${filters.date}&`;
            } else if (filters.startDate && filters.endDate) {
                attendanceUrl += `startDate=${filters.startDate}&endDate=${filters.endDate}&`;
            }
        }

        if (selectedCenter) {
            attendanceUrl += `centerId=${selectedCenter}&`;
        }

        if (examType) {
            attendanceUrl += `examType=${examType}&`; // Include exam type
        }

        try {
            const data = await fetchData(attendanceUrl);
            setCenterData(data.centerData);
            setLoadingAttendance(false);
        } catch (error) {
            console.error("Error fetching attendance data:", error);
            setLoadingAttendance(false);
        }
    };

    useEffect(() => {
        fetchFinancialData(filters);
        fetchAttendanceData(filters);
    }, [selectedCenter, filters, examType]); // Add examType to dependencies

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
              <Link href="/dashboard" className={"mb-5 flex"}>
                  <Button variant="contained" color="primary">
                      Go to Admin Dashboard
                  </Button>
              </Link>
              <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                      <DateFilterComponent
                            setFilters={setFilters}
                            filters={filters}
                      />
                  </Grid>
                  <Grid item xs={12} md={3}>
                      <FilterSelect
                            options={centers}
                            label={"Centers"}
                            onChange={handleCenterChange}
                            loading={centerLoading}
                            value={selectedCenter}
                      />
                  </Grid>
                  <Grid item xs={12} md={3}>
                      <FilterSelect
                            options={[
                                {name: "Graduate", id: "GRADUATE"},
                                {name: "Teacher", id: "TEACHER"}
                            ]}
                            label={"Exam Type"}
                            onChange={handleExamTypeChange}
                            value={examType}
                      />
                  </Grid>
                  <Grid item xs={12} md={4}>
                      <CardComponent title="Total Attendance" value={totalAttendance} loading={loadingFinancial}/>
                  </Grid>
                  <Grid item xs={12} md={4}>
                      <CardComponent title="Total Income" value={totalIncome} loading={loadingFinancial}/>
                  </Grid>
                  <Grid item xs={12} md={4}>
                      <CardComponent title="Total Outcome" value={totalOutcome} loading={loadingFinancial}/>
                  </Grid>
                  <Grid item xs={12} md={6}>
                      <BarChartComponent data={incomeOutcomeChartData} loading={loadingFinancial}
                                         title="Income vs Outcome"/>
                  </Grid>
                  <Grid item xs={12} md={6}>
                      <Box boxShadow={3} p={3} borderRadius={2} bgcolor="#f5f5f5">
                          <Typography variant="h6" gutterBottom fontWeight="bold" color="secondary">
                              Attendance Summary
                          </Typography>
                          {loadingAttendance ? (
                                <Box display="flex" justifyContent="center" p={3}>
                                    <CircularProgress/>
                                </Box>
                          ) : (
                                <TableContainer component={Paper}>
                                    <Table sx={{minWidth: 300}} aria-label="attendance table">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell align="left">Center Name</TableCell>
                                                <TableCell align="left">Total Students</TableCell>
                                                <TableCell align="left">Total Staff</TableCell>
                                                <TableCell align="left">Total Income</TableCell>
                                                <TableCell align="left">Total Outcome</TableCell>
                                                <TableCell align="left">Net Income</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {centerData && centerData.map((center, index) => (
                                                  <TableRow key={index}>
                                                      <TableCell align="left">{center.centerName}</TableCell>
                                                      <TableCell align="left">{center.totalStudents || 0}</TableCell>
                                                      <TableCell align="left">{center.totalStaff || 0}</TableCell>
                                                      <TableCell align="left">{center.totalIncome || 0}</TableCell>
                                                      <TableCell align="left">{center.totalOutcome || 0}</TableCell>
                                                      <TableCell
                                                            align="left">{(center.totalIncome || 0) - (center.totalOutcome || 0)}</TableCell>
                                                  </TableRow>
                                            ))}

                                            <TableRow>
                                                <TableCell align="left"><strong>Total</strong></TableCell>
                                                <TableCell align="left">
                                                    <strong>{centerData.reduce((acc, center) => acc + (center.totalStudents || 0), 0)}</strong>
                                                </TableCell>
                                                <TableCell align="left">
                                                    <strong>{centerData.reduce((acc, center) => acc + (center.totalStaff || 0), 0)}</strong>
                                                </TableCell>
                                                <TableCell align="left">
                                                    <strong>{centerData.reduce((acc, center) => acc + (center.totalIncome || 0), 0)}</strong>
                                                </TableCell>
                                                <TableCell align="left">
                                                    <strong>{centerData.reduce((acc, center) => acc + (center.totalOutcome || 0), 0)}</strong>
                                                </TableCell>
                                                <TableCell align="left">
                                                    <strong>{centerData.reduce((acc, center) => acc + ((center.totalIncome || 0) - (center.totalOutcome || 0)), 0)}</strong>
                                                </TableCell>
                                            </TableRow>
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                          )}
                      </Box>
                  </Grid>
              </Grid>
          </Container>
    );
};

export default StudentsAttendanceDashboard;
