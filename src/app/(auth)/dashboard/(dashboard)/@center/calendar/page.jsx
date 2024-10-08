"use client";

import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import React, {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import FilterSelect from "@/app/UiComponents/FormComponents/FilterSelect";
import ShiftAssignmentModal from "@/app/UiComponents/Models/ShiftAssignmentModal";
import {isTodayOrYesterday} from "@/helpers/functions/utlity";
import CreateModal from "@/app/UiComponents/Models/CreateModal";
import dayjs from "dayjs";
import {Container, Drawer, IconButton} from "@mui/material";
import {FaTimes} from "react-icons/fa";
import AssignmentAnswer from "@/app/UiComponents/FormComponents/AssignmentAnswer";

export default function CalendarPage() {
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
    } = useDataFetcher("center/calendar", false);
    const columns = [
        {name: "date", label: "Date"},
        {name: "examType", label: "Exam Type"}
    ];
    const [centers, setCenters] = useState([]);
    const [centerLoading, setCenterLoading] = useState(true);

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
    const [shifts, setShifts] = useState([]); // Add state to hold shifts data

    useEffect(() => {
        // Fetch shifts data
        const fetchShifts = async () => {
            const response = await fetch("/api/index?id=shift"); // Adjust the API endpoint if necessary
            const result = await response.json();
            setShifts(result.data);
        };
        fetchShifts();
    }, []);

    const searchParams = useSearchParams();
    const selectedExamType = searchParams.get('examType');
    const router = useRouter();
    const [dayAttendanceId, setDayAttendanceId] = useState(null)
    const [openDrawer, setOpenDrawer] = useState(null)

    useEffect(() => {
        setFilters((prevFilters) => ({...prevFilters, examType: selectedExamType}));
    }, [selectedExamType]);

    const handleExamTypeChange = (event) => {
        const examType = event.target.value;
        const params = new URLSearchParams(searchParams);
        if (examType) {
            params.set('examType', examType);
        } else {
            params.delete('examType');
        }
        router.push(`?${params.toString()}`);
    };

    const examTypes = [
        {id: "TEACHER", value: "Teacher"},
        {id: "GRADUATE", value: "Graduate"}
    ];
    const filterExamTypes = [
        {id: "TEACHER", name: "Teacher"},
        {id: "GRADUATE", name: "Graduate"}
    ];
    const inputs = [
        {
            data: {id: "date", type: "date", label: "Date"},
            pattern: {required: {value: true, message: "Please select a date"}}
        },
        {
            data: {id: "examType", type: "SelectField", label: "Exam Type", options: examTypes, loading: false},
            pattern: {required: {value: true, message: "Please select an exam type"}}
        }
    ];

    function onClose() {
        setDayAttendanceId(null)
        setOpenDrawer(false)
    }

    function handleAfterSubmit(dayAttendanceId) {
        setDayAttendanceId(dayAttendanceId)
        setOpenDrawer(true)
    }

    return (
          <div>
              <Drawer anchor="bottom" open={openDrawer} onClose={onClose}>
                  <Container maxWidth="xl"
                             sx={{p: 2, height: '100vh', overflow: 'auto', position: 'relative', zIndex: 1}}>
                      <IconButton onClick={onClose} sx={{position: 'absolute', right: 16, top: 16}}>
                          <FaTimes/>
                      </IconButton>
                      <AssignmentAnswer dayAttendanceId={dayAttendanceId} onClose={onClose}/>
                  </Container>
              </Drawer>
              <div className={"grid grid-cols-2 gap-5 items-center my-2 bg-bgSecondary w-full py-2 px-2"}>
                  <FilterSelect options={filterExamTypes} label={"Exam Type"} onChange={handleExamTypeChange}
                                loading={false} value={selectedExamType}/>
              </div>
              <AdminTable
                    data={data}
                    columns={columns}
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                    total={total}
                    setTotal={setTotal}
                    inputs={inputs}
                    setData={setData}
                    loading={loading}
                    isCalendar={true}
                    setFilters={setFilters}
                    labelKey="examType"
                    extraComponent={({item}) => (
                          <>
                              {isTodayOrYesterday(item.date) && (
                                    <ShiftAssignmentModal shifts={shifts} setFilters={setFilters} setData={setData}
                                                          item={item} label={"Attendees"} href="center/attendance"
                                                          centers={centers}
                                                          centerLoading={centerLoading}
                                                          handleAfterSubmit={handleAfterSubmit}
                                    />
                              )}
                              <CreateModal label={"Total Students"}
                                           extraSubmitData={{
                                               date: item.date,
                                               examType: item.examType
                                           }}
                                           href={"/center/attendance/students"}
                                           inputs={[{
                                               data: {
                                                   id: "totalAttendedStudents",
                                                   label: "Total number of students attended",
                                                   type: "number"
                                               }
                                               , pattern: {
                                                   required: {value: true, message: "Please enter total students"}
                                               }

                                           },
                                           ]}
                                           extraProps={{
                                               formTitle: `Student attendance`,
                                               subTitle: `Date: ${dayjs(item.date).format('YYYY-MM-DD')} , ${item.examType}`,
                                               btnText: "Submit"
                                           }}

                              />
                          </>
                    )}
              />
          </div>
    );
}
