"use client";
import {  Box } from "@mui/material";

import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";

import SearchComponent from "@/app/UiComponents/FormComponents/SearchComponent";

export default function STAFF() {
    const { data, loading, setData, page, setPage, limit, setLimit, total, setTotal, setFilters } = useDataFetcher("center", false);
    const columns = [
        { name: "name", label: "Name" },
        { name: "email", label: "Email" },
        { name: "rating", label: "Rating" },
        { name: "emiratesId", label: "Emirates ID" },
        { name: "totalRewards", label: "Total Rewards" },
        { name: "duty.name", label: "Duty" },
    ];



    return (
          <div>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <SearchComponent
                        apiEndpoint="/api/index?id=user&centerId=true"
                        setFilters={setFilters}
                        inputLabel="Search User By EmiratesId"
                        renderKeys={["name","emiratesId", "email"]}
                        mainKey="emiratesId"
                  />

              </Box>
              <AdminTable
                    withEdit={false}
                    withDelete={false}
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
                    deleteHref={null}
              />
          </div>
    );
}
