"use client";
import {Box, Button, Checkbox, FormControlLabel} from "@mui/material";
import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import SearchComponent from "@/app/UiComponents/FormComponents/SearchComponent";
import React, {useState} from "react";
import AttendanceDetailDrawer from "@/app/UiComponents/DataViewer/AttendanceDetailDrawer";
import DateFilterComponent from "@/app/UiComponents/FormComponents/DateFilterComponent";
import DrawerWithContent from "@/app/UiComponents/Models/DrawerWithContent";
import AssignmentAnswers from "@/app/UiComponents/FormComponents/AssignmentAnswer";

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
    } = useDataFetcher("center/attendance", false);
    const [otherCenters, setOtherCenters] = useState(null);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedAttendanceId, setSelectedAttendanceId] = useState(null);
    const [userAssignment, setUserAssignment] = useState(null)
    const columns = [
        {name: "user.name", label: "Name"},
        {name: "user.emiratesId", label: "Emirates ID"},
        {name: "date", label: "Date"},
        {name: "examType", label: "Exam Type"},
        {name: "_count.attendances", label: "Attended Shifts"},
    ];
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
                                                View the document </Button>
                                        </a>
                                    </>
                                    : "Not signed yet."
                              }
                              <Button onClick={() => handleRowClick(item.id, item)}>View Details</Button>
                          </div>
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
                    center={true}
                    setData={setData}
                    userAssignment={userAssignment}
              />
          </div>
    );
}
