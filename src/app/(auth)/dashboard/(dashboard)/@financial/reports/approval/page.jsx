"use client";

import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import {useEffect, useState} from "react";
import {Box, Button, Menu, MenuItem, Typography} from "@mui/material";
import {useRouter, useSearchParams} from "next/navigation";
import FilterSelect from "@/app/UiComponents/FormComponents/FilterSelect";
import SearchComponent from "@/app/UiComponents/FormComponents/SearchComponent";
import RangeDateComponent from "@/app/UiComponents/FormComponents/MUIInputs/RangeDateComponent";
import dayjs from "dayjs";
import DownloadButton from "@/app/UiComponents/Buttons/DownloadButton";
import ReminderButton from "@/app/UiComponents/Buttons/ReminderButton";
import {FiFilter} from "react-icons/fi";
import RemoveAttendanceButton from "@/app/UiComponents/Buttons/RemoveAttendanceButton";

export default function UserBankApprovalReports() {
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
    } = useDataFetcher("finincal/reports/attendances", false);
    const columns = [
        {name: "user.name", label: "Name"},
        {name: "user.email", label: "Email"},
        {name: "attendances[0].center.name", label: "Center"},
        {name: "user.phone", label: "Phone"},
        {name: "user.emiratesId", label: "Emirates ID"},
        {name: "date", label: "Attendance date"}
    ];
    const now = dayjs();
    const firstDayOfMonth = now.startOf('month').format('YYYY-MM-DD');
    const lastDayOfMonth = now.endOf('month').format('YYYY-MM-DD');

    const [startDate, setStartDate] = useState(firstDayOfMonth);
    const [endDate, setEndDate] = useState(lastDayOfMonth);
    const [centers, setCenters] = useState([]);
    const [type, setType] = useState('');
    const searchParams = useSearchParams();
    const selectedCenter = searchParams.get('centerId');
    const router = useRouter();
    const [resetTrigger, setResetTrigger] = useState(null);
    const [centerLoading, setCenterLoading] = useState(true);
    const [anchorEl, setAnchorEl] = useState(null);

    useEffect(() => {
        updateFilters({centerId: selectedCenter});
    }, [selectedCenter]);

    async function fetchCenters() {
        setCenterLoading(true);
        const response = await fetch("/api/index?id=center");
        const result = await response.json();
        setCenters(result.data || []);
        setCenterLoading(false);
    }

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

    useEffect(() => {
        handleFetchSelectItem();
    }, []);

    async function handleFetchSelectItem() {
        await fetchCenters();
    }

    const handleCenterChange = (event) => {
        const centerId = event.target.value;
        const params = new URLSearchParams(searchParams);
        if (centerId) {
            params.set('centerId', centerId);
        } else {
            params.delete('centerId');
        }
        updateFilters({userId: null})
        setResetTrigger((prev) => !prev);
        router.push(`?${params.toString()}`);
    };

    const handleTypeChange = (event) => {
        const type = event.target.value;
        setType(type);
        updateFilters({type: type});
    };

    const handleFilterClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleFilterClose = () => {
        setAnchorEl(null);
    };
    return (
          <div>
              <Typography variant="h3" color="primary" p={2}>
                  User Attendances approvals
              </Typography>
              <Box sx={{
                  display: 'flex',
                  gap: 2,
                  mb: 0,
                  p: 2,
                  justifyContent: "space-between",
                  flexDirection: {
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

                  <Button
                        variant="outlined"
                        startIcon={<FiFilter/>}
                        onClick={handleFilterClick}
                  >
                      filters
                  </Button>

                  <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleFilterClose}
                        PaperProps={{
                            style: {
                                width: '300px',
                            },
                        }}
                  >
                      <MenuItem>
                          <RangeDateComponent
                                startDate={startDate}
                                endDate={endDate}
                                handleStartDateChange={handleStartDateChange}
                                handleEndDateChange={handleEndDateChange}
                          />
                      </MenuItem>
                      <MenuItem>
                          <FilterSelect
                                options={centers}
                                label={"Centers"}
                                onChange={handleCenterChange}
                                loading={centerLoading}
                                value={selectedCenter}
                          />
                      </MenuItem>
                      <MenuItem>
                          <FilterSelect
                                options={[
                                    {id: 'uploaded', name: 'Uploaded'},
                                    {id: 'non-uploaded', name: 'Non-uploaded'}
                                ]}
                                label={"Attachment Status"}
                                onChange={handleTypeChange}
                                value={type}
                                loading={false}
                          />
                      </MenuItem>
                  </Menu>
                  {centers &&
                        <ReminderButton centers={centers}/>
                  }
                  <DownloadButton data={data}/>
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

                          <>
                              {item.attachment?.length > 0 ?
                                    <>
                                        <a href={item.attachment} target="_blank" rel="noopener noreferrer">
                                            <Button>
                                                Preview approval
                                            </Button>
                                        </a>
                                        <RemoveAttendanceButton item={item} setData={setData}/>
                                    </>
                                    : "No attachment uploaded"
                              }
                          </>
                    )}
              />
          </div>
    );
}
