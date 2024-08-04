"use client";
import {Box, Button, Typography} from "@mui/material";
import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import SearchComponent from "@/app/UiComponents/FormComponents/SearchComponent";
import {useEffect, useState} from "react";
import dayjs from "dayjs";
import AttendanceDetailDrawer from "@/app/UiComponents/DataViewer/AttendanceDetailDrawer";
import RangeDateComponent from "@/app/UiComponents/FormComponents/MUIInputs/RangeDateComponent";
import DateComponent from "@/app/UiComponents/FormComponents/MUIInputs/DateChangerComponent";
import FilterSelect from "@/app/UiComponents/FormComponents/FilterSelect";
import {useRouter, useSearchParams} from "next/navigation";
import {useSelector} from "react-redux";

export default function Attendance() {
    let user = useSelector((state) => state.auth);

    const {
        data,
        loading,
        setData,
        page,
        setPage,
        limit,
        setLimit,
        total,
        setTotal,
        setFilters
    } = useDataFetcher("finincal/attendance", false);
    const now = dayjs();
    const firstDayOfMonth = now.startOf('month').format('YYYY-MM-DD');
    const lastDayOfMonth = now.endOf('month').format('YYYY-MM-DD');

    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(lastDayOfMonth);
    const [date, setDate] = useState(null);
    const [centers, setCenters] = useState([]);
    const searchParams = useSearchParams();
    const selectedCenter = searchParams.get('centerId');
    const router = useRouter();
    const [resetTrigger, setResetTrigger] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedAttendanceId, setSelectedAttendanceId] = useState(null);
    const [centerLoading, setCenterLoading] = useState(true);

    useEffect(() => {
        setFilters({centerId: selectedCenter});
    }, [selectedCenter]);

    async function fetchCenters() {
        setCenterLoading(true);
        const response = await fetch("/api/index?id=center");
        const result = await response.json();
        setCenters(result.data || []);
        setCenterLoading(false);
    }

    const columns = [
        {name: "name", label: "Name"},
        {name: "emiratesId", label: "Emirates ID"},
        {name: "date", label: "Date"},
        {name: "examType", label: "Exam Type"},
        {name: "numberOfShifts", label: "Attended Shifts"},
    ];

    async function handleFetchSelectItem() {
        await fetchCenters();
    }

    useEffect(() => {
        handleFetchSelectItem();
    }, []);

    const handleCenterChange = (event) => {
        const centerId = event.target.value;
        const params = new URLSearchParams(searchParams);
        if (centerId) {
            params.set('centerId', centerId);
        } else {
            params.delete('centerId');
        }
        setFilters({userId: null});
        setResetTrigger((prev) => !prev);
        router.push(`?${params.toString()}`);
    };
    const handleDateChange = (newDate) => {
        setDate(newDate ? dayjs(newDate).format('YYYY-MM-DD') : null);
        updateFilters({date: newDate ? dayjs(newDate).format('YYYY-MM-DD') : null, startDate: null, endDate: null});
    };
    const handleStartDateChange = (newDate) => {
        setStartDate(newDate);
        updateFilters({startDate: newDate ? dayjs(newDate).format('YYYY-MM-DD') : null, date: null});
    };

    const handleEndDateChange = (newDate) => {
        setEndDate(newDate);
        updateFilters({endDate: newDate ? dayjs(newDate).format('YYYY-MM-DD') : null, date: null});
    };
    const updateFilters = (newFilters) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            ...newFilters,
        }));
    };

    const handleRowClick = (attendanceId) => {
        setSelectedAttendanceId(attendanceId);
        setDrawerOpen(true);
    };

    return (
          <div>
              <Typography variant="h3" color="primary" p={2}>
                  Edit attendance
              </Typography>
              <Box sx={{
                  display: 'flex', gap: 2, mb: 0, p: 2, justifyContent: "space-between", flexDirection: {
                      xs: "column",
                      sm: "column",
                      md: "row",
                  }
              }}>
                  <SearchComponent
                        apiEndpoint={"/api/index?id=user&center=" + selectedCenter}
                        setFilters={setFilters}
                        inputLabel="Search User By EmiratesId"
                        renderKeys={["name", "emiratesId", "email"]}
                        mainKey="emiratesId"
                        resetTrigger={resetTrigger}
                  />
                  <RangeDateComponent
                        startDate={startDate}
                        endDate={endDate}
                        handleStartDateChange={handleStartDateChange}
                        handleEndDateChange={handleEndDateChange}
                  />
                  <DateComponent date={date} handleDateChange={handleDateChange}
                                 label="Select a day"
                  />
                  <FilterSelect
                        options={centers}
                        label={"Centers"}
                        onChange={handleCenterChange}
                        loading={centerLoading}
                        value={selectedCenter}
                  />
              </Box>
              <AdminTable
                    data={data}
                    columns={columns}
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                    total={total}
                    setTotal={setTotal}
                    setData={setData}
                    loading={loading}
                    extraComponent={({item}) => (
                          <Button onClick={() => handleRowClick(item.id)}>View Details</Button>
                    )}
              />
              <AttendanceDetailDrawer
                    dayAttendanceId={selectedAttendanceId}
                    open={drawerOpen}
                    onClose={() => {
                        setDrawerOpen(false)
                        setSelectedAttendanceId(null)
                    }}
                    setData={setData}
                    finincalId={user.data.id}
              />
          </div>
    );
}
