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
    const [attendanceModalOpen, setAttendanceModalOpen] = useState(false);
    const [bankDetailsModalOpen, setBankDetailsModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedCenter, setSelectedCenter] = useState('');
    const [attendanceData, setAttendanceData] = useState([]);
    const [bankDetailsData, setBankDetailsData] = useState([]);
    const [loadingAttendance, setLoadingAttendance] = useState(false);
    const [loadingBankDetails, setLoadingBankDetails] = useState(false);
    const [noDataMessage, setNoDataMessage] = useState("");
    const searchParams = useSearchParams();
    const selectedExamType = searchParams.get('examType');
    const router = useRouter();
    const [apiExamType, setApiExamType] = useState("")
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

    const handleClick = (item) => {
        setSelectedDate(item.date);
        setApiExamType(item.examType)
        setAttendanceModalOpen(true);
    };

    const handleFetchAttendance = async () => {
        setLoadingAttendance(true);
        const response = await fetch(`/api/finincal/attendance/report?date=${selectedDate}&centerId=${selectedCenter}&examType=${apiExamType}`);
        const result = await response.json();
        setAttendanceData(result.data || []);
        if (result.data.length === 0) {
            setNoDataMessage("No data for this center");
        } else {
            setNoDataMessage("");
        }
        setLoadingAttendance(false);
    };

    const handleFetchBankDetails = async () => {
        setLoadingBankDetails(true);
        const response = await fetch(`/api/finincal/bankdetails/report?date=${selectedDate}&centerId=${selectedCenter}`);
        const result = await response.json();
        setBankDetailsData(result.data || []);
        if (result.data.length === 0) {
            setNoDataMessage("No data for this center");
        } else {
            setNoDataMessage("");
        }
        setLoadingBankDetails(false);
    };
    const handleGenerateAttendanceExcel = async () => {
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
                width: 32,
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
                width: 22,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            },
            {
                column: 'Exam Date',
                type: String,
                value: student => dayjs(student.date).format('YYYY-MM-DD'),
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 32,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            },
            {
                column: 'Attended at',
                type: String,
                value: student => student.center.name,
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 32,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            },
            {
                column: 'Duty',
                type: String,
                value: student => student.duty.name,
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
                value: student => student.attendances[0].dutyRewards[0].amount,
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
            totalReward: item.totalReward,
            center: item.center
            , duty: item.attendances[0].dutyRewards[0].duty,
            date: item.date,
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

    const handleGenerateBankDetailsExcel = async () => {
        const schema = [
            {
                column: 'No',
                type: Number,
                value: item => item.No,
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
                value: item => item.user.name,
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 32,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            },
            {
                column: 'Email',
                type: String,
                value: item => item.user.email,
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 35,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            },
            {
                column: 'Phone',
                type: String,
                value: item => item.user.phone,
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 20,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            },
            {
                column: 'Bank Name',
                type: String,
                value: item => item.user.bankName,
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 30,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            },
            {
                column: 'Bank User Name',
                type: String,
                value: item => item.user.bankUserName,
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 32,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            },
            {
                column: 'IBAN',
                type: String,
                value: item => item.user.ibanBank,
                fontWeight: 'bold',
                align: 'center',
                alignVertical: 'center',
                width: 32,
                height: 25,
                borderColor: '#000000',
                borderStyle: 'thin'
            }
        ];

        const data = bankDetailsData.map((item, index) => ({
            No: index + 1,
            user: item.user
        }));

        await writeXlsxFile(data, {
            schema,
            fileName: `Bank_Details_Report_${dayjs(selectedDate).format('YYYY-MM-DD')}.xlsx`,
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
                          <div className={"flex flex-col gap-1 items-center justify-center w-full my-1"}>
                              <Button color="tertiary" variant="contained" onClick={() => {
                                  handleClick(item);
                                  setNoDataMessage("");
                              }}>
                                  Attendances sheet
                              </Button>
                              <Button color="tertiary" variant="contained"

                                      onClick={() => {
                                          setSelectedDate(item.date);
                                          setBankDetailsModalOpen(true);
                                          setNoDataMessage("");
                                      }}>
                                  Bank Details sheet
                              </Button>
                          </div>
                    )}
              />
              <Modal
                    open={attendanceModalOpen}
                    onClose={() => {
                        setAttendanceData([]);
                        setAttendanceModalOpen(false);
                    }}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                    sx={{
                        z: 999,
                    }}
              >
                  <Fade in={attendanceModalOpen}>
                      <Box sx={{...simpleModalStyle}}>
                          <Typography variant="h6" id="modal-modal-title">Select Center
                              for {dayjs(selectedDate).format('YYYY-MM-DD')}</Typography>
                          <FilterSelect options={centers} label={"Centers"}
                                        onChange={(e) => {
                                            setSelectedCenter(e.target.value);
                                            setAttendanceData([]);
                                        }} loading={centerLoading}
                                        value={selectedCenter}/>
                          <Button variant="contained" color="primary" onClick={handleFetchAttendance}
                                  disabled={loadingAttendance}>
                              {loadingAttendance ? <CircularProgress size={24}/> : "Fetch Attendances"}
                          </Button>
                          {attendanceData?.length > 0 && (
                                <Button variant="contained" color="secondary" onClick={handleGenerateAttendanceExcel}>
                                    Generate Excel Report
                                </Button>
                          )}
                          {noDataMessage?.length > 0 && (
                                <Typography variant="body1" color="error">
                                    {noDataMessage}
                                </Typography>
                          )}
                      </Box>
                  </Fade>
              </Modal>

              <Modal
                    open={bankDetailsModalOpen}
                    onClose={() => {
                        setBankDetailsData([]);
                        setBankDetailsModalOpen(false);
                    }}
                    aria-labelledby="modal-modal-title"
                    aria-describedby="modal-modal-description"
                    sx={{
                        z: 999,
                    }}
              >
                  <Fade in={bankDetailsModalOpen}>
                      <Box sx={{...simpleModalStyle}}>
                          <Typography variant="h6" id="modal-modal-title">Select Center
                              for {dayjs(selectedDate).format('YYYY-MM-DD')}</Typography>
                          <FilterSelect options={centers} label={"Centers"}
                                        onChange={(e) => {
                                            setSelectedCenter(e.target.value);
                                            setBankDetailsData([]);
                                        }} loading={centerLoading}
                                        value={selectedCenter}/>
                          <Button variant="contained" color="primary" onClick={handleFetchBankDetails}
                                  disabled={loadingBankDetails}>
                              {loadingBankDetails ? <CircularProgress size={24}/> : "Fetch Bank Details"}
                          </Button>
                          {bankDetailsData?.length > 0 && (
                                <Button variant="contained" color="secondary" onClick={handleGenerateBankDetailsExcel}>
                                    Generate Excel Report
                                </Button>
                          )}
                          {noDataMessage?.length > 0 && (
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
