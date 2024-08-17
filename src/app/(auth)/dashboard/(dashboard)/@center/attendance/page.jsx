"use client";
import {Box, Button, Checkbox, FormControlLabel} from "@mui/material";
import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import SearchComponent from "@/app/UiComponents/FormComponents/SearchComponent";
import React, {useState} from "react";
import dayjs from "dayjs";
import AttendanceDetailDrawer from "@/app/UiComponents/DataViewer/AttendanceDetailDrawer";
import RangeDateComponent from "@/app/UiComponents/FormComponents/MUIInputs/RangeDateComponent";
import DateComponent from "@/app/UiComponents/FormComponents/MUIInputs/DateChangerComponent";
import RemoveAttendanceButton from "@/app/UiComponents/Buttons/RemoveAttendanceButton";

export default function Attendance() {
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
    } = useDataFetcher("center/attendance", false);
    const now = dayjs();
    const firstDayOfMonth = now.startOf('month').format('YYYY-MM-DD');
    const lastDayOfMonth = now.endOf('month').format('YYYY-MM-DD');
    const [otherCenters, setOtherCenters] = useState(null);

    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(lastDayOfMonth);
    const [date, setDate] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedAttendanceId, setSelectedAttendanceId] = useState(null);
    const columns = [
        {name: "name", label: "Name"},
        {name: "emiratesId", label: "Emirates ID"},
        {name: "date", label: "Date"},
        {name: "examType", label: "Exam Type"},
        {name: "numberOfShifts", label: "Attended Shifts"},
    ];

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
              <Box sx={{
                  display: 'flex', gap: 2, mb: 0, p: 2, justifyContent: "space-between", flexDirection: {
                      xs: "column",
                      sm: "column",
                      md: "row",
                  }
              }}>
                  <div className={"flex flex-col gap-1"}>

                      <FormControlLabel
                            control={
                                <Checkbox
                                      checked={otherCenters}
                                      onChange={(e) => setOtherCenters(e.target.checked)}
                                />
                            }
                            label="Search in other centers"
                      />
                      <SearchComponent
                            apiEndpoint={`/api/index?id=user&centerId=${!otherCenters}`}
                            setFilters={setFilters}
                            inputLabel="Search User By EmiratesId"
                            renderKeys={["name", "emiratesId", "email"]}
                            mainKey="emiratesId"
                      />
                  </div>
                  <RangeDateComponent
                        startDate={startDate}
                        endDate={endDate}
                        handleStartDateChange={handleStartDateChange}
                        handleEndDateChange={handleEndDateChange}
                  />
                  <DateComponent date={date} handleDateChange={handleDateChange}
                                 label="Select a day"
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
                    withDelete={true}
                    deleteHref={"center/attendance"}
                    checkDates={true}
                    loading={loading}
                    extraComponent={({item}) => (
                          <div className={"flex gap-5 items-center"}>

                              {item.attachment?.length > 0 ?
                                    <>
                                        <a href={item.attachment} target="_blank" rel="noopener noreferrer">
                                            <Button>
                                                Preview approval
                                            </Button>
                                        </a>
                                        <RemoveAttendanceButton item={item} setData={setData}/>
                                    </>
                                    : "No approval uploaded"
                              }
                              <Button onClick={() => handleRowClick(item.id)}>View Details</Button>
                          </div>
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
