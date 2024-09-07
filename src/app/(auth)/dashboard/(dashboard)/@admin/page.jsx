"use client";
import React, {useState, useEffect} from "react";
import {Box, Container, Grid, Typography, CircularProgress, Button} from "@mui/material";
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
import {useRouter, useSearchParams} from "next/navigation";
import Link from "next/link";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

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
          <Box
                position="relative"
                p={2}
                boxShadow={3}
                borderRadius={2}
                bgcolor="#fff"
                minHeight={300}
                maxHeight={400}
          >
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
              <Typography variant="h6" gutterBottom>
                  {title}
              </Typography>
              <Bar data={data} options={options}/>
          </Box>
    );
};

const AdminDashboard = () => {
    const [totalCenters, setTotalCenters] = useState(null);
    const [totalUsers, setTotalUsers] = useState(null);
    const [activeUsers, setActiveUsers] = useState(null);
    const [uncompletedUsers, setUncompletedUsers] = useState(null);
    const [pendingUsers, setPendingUsers] = useState(null);
    const [totalRewards, setTotalRewards] = useState(null);
    const [paidRewards, setPaidRewards] = useState(null);
    const [unpaidRewards, setUnpaidRewards] = useState(null);
    const [comingExams, setComingExams] = useState(null);
    const [oldExams, setOldExams] = useState(null);

    const [loadingCenters, setLoadingCenters] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [loadingRewards, setLoadingRewards] = useState(true);
    const [loadingPaidRewards, setLoadingPaidRewards] = useState(true);
    const [loadingUnpaidRewards, setLoadingUnpaidRewards] = useState(true);
    const [loadingExams, setLoadingExams] = useState(true);

    const [centers, setCenters] = useState([]);
    const [centerLoading, setCenterLoading] = useState(true);
    const searchParams = useSearchParams();
    const selectedCenter = searchParams.get("centerId");
    const router = useRouter();

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

    useEffect(() => {
        const url = `/api/admin/dashboard?${
              selectedCenter ? `centerId=${selectedCenter}&` : ""
        }`;
        fetchData(`${url}totalCenters=true`)
              .then((data) => {
                  setLoadingCenters(true);
                  setTotalCenters(data.totalCenters);
                  setLoadingCenters(false);
              })
              .catch((error) => {
                  console.error("Error fetching centers data:", error);
                  setLoadingCenters(false);
              });

        fetchData(`${url}totalUsers=true`)
              .then((data) => {
                  setLoadingUsers(true);
                  setTotalUsers(data.totalUsers);
                  setLoadingUsers(false);
              })
              .catch((error) => {
                  console.error("Error fetching users data:", error);
                  setLoadingUsers(false);
              });

        fetchData(`${url}userStatus=true`)
              .then((data) => {
                  setLoadingUsers(true);
                  setActiveUsers(data.activeUsers);
                  setUncompletedUsers(data.uncompletedUsers);
                  setPendingUsers(data.pendingUsers);
                  setLoadingUsers(false);
              })
              .catch((error) => {
                  console.error("Error fetching user status data:", error);
                  setLoadingUsers(false);
              });

        fetchData(`${url}totalRewards=true`)
              .then((data) => {
                  setLoadingRewards(true);
                  setTotalRewards(data.totalRewards);
                  setLoadingRewards(false);
              })
              .catch((error) => {
                  console.error("Error fetching total rewards data:", error);
                  setLoadingRewards(false);
              });

        fetchData(`${url}paidRewards=true`)
              .then((data) => {
                  setLoadingPaidRewards(true);
                  setPaidRewards(data.paidRewards);
                  setLoadingPaidRewards(false);
              })
              .catch((error) => {
                  console.error("Error fetching paid rewards data:", error);
                  setLoadingPaidRewards(false);
              });

        fetchData(`${url}unpaidRewards=true`)
              .then((data) => {
                  setLoadingUnpaidRewards(true);
                  setUnpaidRewards(data.unpaidRewards);
                  setLoadingUnpaidRewards(false);
              })
              .catch((error) => {
                  console.error("Error fetching unpaid rewards data:", error);
                  setLoadingUnpaidRewards(false);
              });

        fetchData(`${url}examsSummary=true`)
              .then((data) => {
                  setLoadingExams(true);
                  setComingExams(data.comingExams);
                  setOldExams(data.oldExams);
                  setLoadingExams(false);
              })
              .catch((error) => {
                  console.error("Error fetching exams data:", error);
                  setLoadingExams(false);
              });
    }, [selectedCenter]);

    const userStatusChartData = {
        labels: ["Active Users", "Uncompleted Users", "Pending Users"],
        datasets: [
            {
                label: "User Status",
                data: [activeUsers, uncompletedUsers, pendingUsers],
                backgroundColor: ["#4BC0C0", "#FF6384", "#FF9F40"],
            },
        ],
    };

    const rewardsChartData = {
        labels: ["Total Rewards", "Paid Rewards", "Unpaid Rewards"],
        datasets: [
            {
                label: "Rewards",
                data: [totalRewards, paidRewards, unpaidRewards],
                backgroundColor: ["#FFCE56", "#7D4F50", "#90A4AE"],
            },
        ],
    };

    return (
          <Container>
              <Typography
                    variant="h4"
                    gutterBottom
                    fontWeight="bold"
                    color="primary"
                    mt={2}
              >
                  Admin Dashboard (Current Year)
              </Typography>
              <Link href="/dashboard/financial">
                  <Button variant="contained" color="primary">
                      Go to Financial Dashboard
                  </Button>
              </Link>
              <Grid container spacing={3}>
                  <Grid item xs={12}>
                      <FilterSelect
                            options={centers}
                            label={"Centers"}
                            onChange={handleCenterChange}
                            loading={centerLoading}
                            value={selectedCenter}
                      />
                  </Grid>
                  <Grid item xs={12} md={3}>
                      <CardComponent
                            title="Total Centers"
                            value={totalCenters}
                            loading={loadingCenters}
                      />
                  </Grid>
                  <Grid item xs={12} md={3}>
                      <CardComponent
                            title="Total Users"
                            value={totalUsers}
                            loading={loadingUsers}
                      />
                  </Grid>
                  <Grid item xs={12} md={3}>
                      <CardComponent
                            title="Coming Exams"
                            value={comingExams}
                            loading={loadingExams}
                      />
                  </Grid>
                  <Grid item xs={12} md={3}>
                      <CardComponent
                            title="Old Exams"
                            value={oldExams}
                            loading={loadingExams}
                      />
                  </Grid>
                  <Grid item xs={12} md={6}>
                      <BarChartComponent
                            data={userStatusChartData}
                            loading={
                                  loadingCenters ||
                                  loadingUsers ||
                                  loadingRewards ||
                                  loadingPaidRewards ||
                                  loadingUnpaidRewards
                            }
                            title="User Status Summary"
                      />
                  </Grid>
                  <Grid item xs={12} md={6}>
                      <BarChartComponent
                            data={rewardsChartData}
                            loading={
                                  loadingRewards || loadingPaidRewards || loadingUnpaidRewards
                            }
                            title="Rewards Summary"
                      />
                  </Grid>
              </Grid>
          </Container>
    );
};

export default AdminDashboard;
