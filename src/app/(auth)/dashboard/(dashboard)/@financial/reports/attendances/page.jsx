"use client";

import React, {useState, useEffect} from "react";
import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import {Button, Box, Modal, Typography, Fade, CircularProgress} from "@mui/material";
import {useRouter, useSearchParams} from "next/navigation";
import FilterSelect from "@/app/UiComponents/FormComponents/FilterSelect";

import dayjs from "dayjs";
import {simpleModalStyle} from "@/app/constants";
import writeXlsxFile from "write-excel-file";

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
    } = useDataFetcher("finincal/calendar", false);
    const columns = [
        {name: "date", label: "Date"},
        {name: "examType", label: "Exam Type"}
    ];

    const [centers, setCenters] = useState([]);
    const [centerLoading, setCenterLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedCenter, setSelectedCenter] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [noDataMessage, setNoDataMessage] = useState("")
    const searchParams = useSearchParams();
    const selectedExamType = searchParams.get('examType');
    const router = useRouter();

    useEffect(() => {
        setFilters((prevFilters) => ({...prevFilters, examType: selectedExamType}));
    }, [selectedExamType]);

    useEffect(() => {
        fetchCenters();
    }, []);

    const fetchCenters = async () => {
        setCenterLoading(true);
        const response = await fetch("/api/index?id=center");
        const result = await response.json();
        setCenters(result.data || []);
        setCenterLoading(false);
    };

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

    const handleDateClick = (item) => {
        setSelectedDate(item.date);
        setModalOpen(true);
    };

    const handleFetchAttendance = async () => {
        setLoadingAttendance(true);
        const response = await fetch(`/api/finincal/attendance/report?date=${selectedDate}&centerId=${selectedCenter}`);
        const result = await response.json();
        setAttendanceData(result.data || []);
        if (result.data.length === 0) {
            setNoDataMessage("No data for this center");
        } else {
            setNoDataMessage("")
        }
        setLoadingAttendance(false);
    };


    const handleGenerateExcel = async () => {
        const schema = [
            {
                column: 'No',
                type: Number,
                value: student => student.No,
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 5,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            },
            {
                column: 'Name',
                type: String,
                value: student => student.user.name,
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 30,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            },
            {
                column: 'Emirates ID',
                type: String,
                value: student => student.user.emiratesId,
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 20,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            },
            {
                column: 'Center',
                type: String,
                value: student => student.user.center.name,
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 15,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            },
            {
                column: 'Duty',
                type: String,
                value: student => student.user.duty.name,
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 20,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            },
            {
                column: 'Rate',
                type: Number,
                value: student => student.user.duty.amount,
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 15,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            },
            {
                column: 'Number of Shifts',
                type: Number,
                value: student => student.attendances.length,
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 25,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            },
            {
                column: 'Total Amount',
                type: Number,
                value: student => student.totalReward,
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 20,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            }
        ];

        const data = attendanceData.map((item, index) => ({
            No: index + 1,
            user: item.user,
            attendances: item.attendances,
            totalReward: item.totalReward
        }));

        await writeXlsxFile(data, {
            schema,
            fileName: `Attendance_Report_${dayjs(selectedDate).format('YYYY-MM-DD')}.xlsx`,
            headerStyle: {
                backgroundColor: '#D3E4FF', // Light blue color
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                height: 30
            }
        });
    };

    const filterExamTypes = [
        {id: "TEACHER", name: "Teacher"},
        {id: "GRADUATE", name: "Graduate"}
    ];

    return (
          <div>
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
                    setData={setData}
                    loading={loading}
                    isCalendar={true}
                    setFilters={setFilters}
                    labelKey="examType"
                    extraComponent={({item}) => (
                          <Button color="secondary" variant="contained" onClick={() => {
                              handleDateClick(item)
                              setNoDataMessage("")
                          }}>
                              Attendances sheet</Button>
                    )}
              />
              <Modal
                    open={modalOpen}
                    onClose={() => {
                        setAttendanceData([])
                        setModalOpen(false)
                    }}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                    sx={{
                        z: 999,
                    }}
              >
                  <Fade in={modalOpen}>

                      <Box sx={{...simpleModalStyle}}>
                          <Typography variant="h6" id="modal-modal-title">Select Center
                              for {dayjs(selectedDate).format('YYYY-MM-DD')}</Typography>
                          <FilterSelect options={centers} label={"Centers"}
                                        onChange={(e) => {
                                            setSelectedCenter(e.target.value)
                                            setAttendanceData([])

                                        }} loading={centerLoading}
                                        value={selectedCenter}/>
                          <Button variant="contained" color="primary" onClick={handleFetchAttendance}
                                  disabled={loadingAttendance}>
                              {loadingAttendance ? <CircularProgress size={24}/> : "Fetch Attendances"}
                          </Button>
                          {attendanceData.length > 0 && (
                                <Button variant="contained" color="secondary" onClick={handleGenerateExcel}>
                                    Generate Excel Report
                                </Button>
                          )}
                          {noDataMessage.length > 0 && (
                                <Typography variant="body1" color="error">
                                    {noDataMessage}
                                </Typography>
                          )}
                      </Box>
                  </Fade>
              </Modal>
          </div>
    );
}
