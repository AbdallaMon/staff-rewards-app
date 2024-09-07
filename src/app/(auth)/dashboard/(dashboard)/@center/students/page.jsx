"use client";
import {Box, Checkbox, FormControlLabel} from "@mui/material";
import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import SearchComponent from "@/app/UiComponents/FormComponents/SearchComponent";
import React, {useState} from "react";
import dayjs from "dayjs";
import RangeDateComponent from "@/app/UiComponents/FormComponents/MUIInputs/RangeDateComponent";
import DateComponent from "@/app/UiComponents/FormComponents/MUIInputs/DateChangerComponent";
import DateFilterComponent from "@/app/UiComponents/FormComponents/DateFilterComponent";

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
        setFilters,
        filters
    } = useDataFetcher("center/attendance/students", false);

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


    return (
          <div>
              <Box sx={{
                  display: 'flex', gap: 2, mb: 0, p: 2, justifyContent: "space-between", flexDirection: {
                      xs: "column",
                      sm: "column",
                      md: "row",
                  }
              }}>
                  <DateFilterComponent
                        setFilters={setFilters}
                        filters={filters}
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
