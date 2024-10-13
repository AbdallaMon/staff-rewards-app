"use client";
import {Box, Button, Typography} from "@mui/material";
import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import SearchComponent from "@/app/UiComponents/FormComponents/SearchComponent";
import React, {useEffect, useState} from "react";
import AttendanceDetailDrawer from "@/app/UiComponents/DataViewer/AttendanceDetailDrawer";
import FilterSelect from "@/app/UiComponents/FormComponents/FilterSelect";
import {useRouter, useSearchParams} from "next/navigation";
import DateFilterComponent from "@/app/UiComponents/FormComponents/DateFilterComponent";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {PdfReport, UserRatingReport} from "@/app/UiComponents/Templatese/PdfAssigmentsReport";
import "dayjs/locale/en-gb";
import dayjs from "dayjs";

dayjs.locale("en-gb");

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
        setFilters,
        filters
    } = useDataFetcher("admin/attendance", false);
    const [centers, setCenters] = useState([]);
    const searchParams = useSearchParams();
    const selectedCenter = searchParams.get('centerId');
    const router = useRouter();
    const [resetTrigger, setResetTrigger] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedAttendanceId, setSelectedAttendanceId] = useState(null);
    const [centerLoading, setCenterLoading] = useState(true);
    const [userAssignment, setUserAssignment] = useState(null)

    useEffect(() => {
        setFilters({...filters, centerId: selectedCenter, userId: null});
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
        {name: "totalRating", label: "Total rating", type: "modules"},
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
        setResetTrigger((prev) => !prev);
        router.push(`?${params.toString()}`);
    };


    const handleRowClick = (attendanceId, item) => {
        const userAssignmentData = {
            isEdit: item.userAssignment,
            userAssignmentId: item.userAssignment ? item.userAssignment.id : null,
            userId: item.userId
        }
        setUserAssignment(userAssignmentData)
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
                  },
                  flexWrap: "wrap"
              }}>
                  <SearchComponent
                        apiEndpoint={"/api/index?id=user&center=" + selectedCenter}
                        setFilters={setFilters}
                        inputLabel="Search User By EmiratesId"
                        renderKeys={["name", "emiratesId", "email"]}
                        mainKey="emiratesId"
                        resetTrigger={resetTrigger}
                  />
                  <DateFilterComponent
                        setFilters={setFilters}
                        filters={filters}
                  />
                  <div className={"w-fit"}>
                      <FilterSelect
                            options={centers}
                            label={"Centers"}
                            onChange={handleCenterChange}
                            loading={centerLoading}
                            value={selectedCenter}
                      />
                  </div>
              </Box>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
                  <div className={"flex gap-5 justify-center items-center flex-wrap"}>
                      <UserRatingReport centers={centers} loadingCenters={centerLoading}/>
                      <PdfReport centers={centers} loadingCenters={centerLoading}/>
                  </div>
              </LocalizationProvider>
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
                    withDelete={true}
                    deleteHref={`/admin/attendance`}
                    extraComponent={({item}) => (
                          <Button onClick={() => handleRowClick(item.id, item)}>View Details</Button>
                    )}
              />
              <AttendanceDetailDrawer
                    dayAttendanceId={selectedAttendanceId}
                    open={drawerOpen}
                    onClose={() => {
                        setDrawerOpen(false)
                        setSelectedAttendanceId(null)
                        setUserAssignment(null)

                    }}
                    setData={setData}
                    admin={true}
                    userAssignment={userAssignment}
              />
          </div>
    );
}
