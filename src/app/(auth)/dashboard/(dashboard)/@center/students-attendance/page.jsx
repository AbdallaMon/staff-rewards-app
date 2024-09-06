"use client";
import {Box, Checkbox, FormControlLabel} from "@mui/material";
import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import SearchComponent from "@/app/UiComponents/FormComponents/SearchComponent";
import React, {useState} from "react";
import dayjs from "dayjs";
import RangeDateComponent from "@/app/UiComponents/FormComponents/MUIInputs/RangeDateComponent";
import DateComponent from "@/app/UiComponents/FormComponents/MUIInputs/DateChangerComponent";

export default function StudentsAttendance() {
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
    } = useDataFetcher("center/attendance/students", false);
    const now = dayjs();
    const firstDayOfMonth = now.startOf('month').format('YYYY-MM-DD');
    const lastDayOfMonth = now.endOf('month').format('YYYY-MM-DD');
    const [otherCenters, setOtherCenters] = useState(null);

    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(lastDayOfMonth);
    const [date, setDate] = useState(null);
    const columns = [
        {name: "date", label: "Date"},
        {name: "examType", label: "Exam Type"},
        {name: "totalAttendedStudents", label: "Total students attended"},
    ];
    const inputs = [{
        data: {
            id: "totalAttendedStudents", type: "number", label: "Total students attended"
        },
        pattern: {
            required: {value: true, message: "Total students is required"}
        }
    }]
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


    return (
          <div>
              <Box sx={{
                  display: 'flex', gap: 2, mb: 0, p: 2, justifyContent: "space-between", flexDirection: {
                      xs: "column",
                      sm: "column",
                      md: "row",
                  }
              }}>
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
                    inputs={inputs}
                    limit={limit}
                    withEdit={true}
                    editHref={"center/attendance/students"}
                    setLimit={setLimit}
                    total={total}
                    setTotal={setTotal}
                    setData={setData}
                    checkDates={true}
                    loading={loading}
              />

          </div>
    );
}
