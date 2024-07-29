"use client";
import { Box, Button } from "@mui/material";
import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import SearchComponent from "@/app/UiComponents/FormComponents/SearchComponent";
import { useState } from "react";
import dayjs from "dayjs";
import AttendanceDetailDrawer from "@/app/UiComponents/DataViewer/AttendanceDetailDrawer";
import RangeDateComponent from "@/app/UiComponents/FormComponents/MUIInputs/RangeDateComponent";

export default function Attendance() {
    const { data, loading, setData, page, setPage, limit, setLimit, total, setTotal, setFilters } = useDataFetcher("center/attendance", false);
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedAttendanceId, setSelectedAttendanceId] = useState(null);

    const columns = [
        { name: "name", label: "Name" },
        { name: "emiratesId", label: "Emirates ID" },
        { name: "date", label: "Date" },
        { name: "reward", label: "Total Reward" },
        { name: "examType", label: "Exam Type" },
        { name: "numberOfShifts", label: "Attended Shifts" },
    ];

    const handleStartDateChange = (newDate) => {
        setStartDate(newDate);
        updateFilters({ startDate: newDate });
    };

    const handleEndDateChange = (newDate) => {
        setEndDate(newDate);
        updateFilters({ endDate: newDate });
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
              <Box sx={{ display: 'flex', gap: 2, mb: 0, p: 2 ,justifyContent:"space-between" ,flexDirection: {
                      xs: "column",
                      sm: "column",
                      md: "row",
                  }
                        }}>
                  <SearchComponent
                        apiEndpoint="/api/index?id=user&centerId=true"
                        setFilters={setFilters}
                        inputLabel="Search User By EmiratesId"
                        renderKeys={["name", "emiratesId", "email"]}
                        mainKey="emiratesId"
                  />
                  <RangeDateComponent
                        startDate={startDate}
                        endDate={endDate}
                        handleStartDateChange={handleStartDateChange}
                        handleEndDateChange={handleEndDateChange}
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
                    extraComponent={({ item }) => (
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
                    center={true}
                    setData={setData}

              />
          </div>
    );
}
