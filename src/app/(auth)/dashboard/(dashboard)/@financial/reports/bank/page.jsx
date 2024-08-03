"use client";

import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import {useEffect, useState} from "react";
import {Box, Button, Typography} from "@mui/material";
import {useRouter, useSearchParams} from "next/navigation";
import FilterSelect from "@/app/UiComponents/FormComponents/FilterSelect";
import Link from "next/link";
import SearchComponent from "@/app/UiComponents/FormComponents/SearchComponent";

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
    } = useDataFetcher("finincal/reports/bankapproval", false);
    const columns = [
        {name: "name", label: "Name"},
        {name: "email", label: "Email"},
        {name: "center.name", label: "Center"},
        {name: "phone", label: "Phone"},
        {name: "emiratesId", label: "Emirates ID"},
    ];

    const [centers, setCenters] = useState([]);
    const searchParams = useSearchParams();
    const selectedCenter = searchParams.get('centerId');
    const router = useRouter();
    const [resetTrigger, setResetTrigger] = useState(null)
    const [centerLoading, setCenterLoading] = useState(true);
    useEffect(() => {
        setFilters({centerId: selectedCenter});
    }, [selectedCenter])

    async function fetchCenters() {
        setCenterLoading(true);
        const response = await fetch("/api/index?id=center");
        const result = await response.json();
        setCenters(result.data || []);
        setCenterLoading(false);
    }


    async function handleFetchSelectItem() {
        await fetchCenters();
    }

    useEffect(() => {
        handleFetchSelectItem();
    }, [])


    const handleCenterChange = (event) => {
        const centerId = event.target.value;
        const params = new URLSearchParams(searchParams);
        if (centerId) {
            params.set('centerId', centerId);
        } else {
            params.delete('centerId');
        }
        setFilters({userId: null})
        setResetTrigger((prev) => !prev)
        router.push(`?${params.toString()}`);
    };
    return (
          <div>
              <Typography variant="h3" color="primary" p={2}>
                  User bank details reports
              </Typography>
              <Box sx={{
                  display: 'flex', gap: 2, mb: 0, p: 2, justifyContent: "space-between", flexDirection: {
                      xs: "column",
                      sm: "column",
                      md: "row",
                  }
              }}>
                  <SearchComponent
                        apiEndpoint={"/api/index?id=user&center=" + selectedCenter}
                        setFilters={setFilters}
                        inputLabel="Search User By EmiratesId"
                        renderKeys={["name", "emiratesId", "email"]}
                        mainKey="emiratesId"
                        resetTrigger={resetTrigger}

                  />
                  <FilterSelect options={centers} label={"Centers"} onChange={handleCenterChange}
                                loading={centerLoading}
                                value={selectedCenter}
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
                    extraComponent={({item}) => (
                          <>
                              {item.bankApprovalAttachment?.length > 0 ?
                                    <a href={item.bankApprovalAttachment} target="_blank">
                                        <Button>
                                            Download approval
                                        </Button>
                                    </a>
                                    : "No attachment uploaded"
                              }
                          </>
                    )}
              />
          </div>
    );
}
