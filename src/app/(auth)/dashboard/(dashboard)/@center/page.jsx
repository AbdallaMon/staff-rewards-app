"use client";
import {Box, Button} from "@mui/material";
import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import SearchComponent from "@/app/UiComponents/FormComponents/SearchComponent";
import AssingNewDutyModal from "@/app/UiComponents/Models/AssingNewDutyModal";
import UserDetailDrawer from "@/app/UiComponents/DataViewer/UserDetailsDrawer";
import {useState} from "react";

export default function STAFF() {
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
    } = useDataFetcher("center", false);
    const columns = [
        {name: "name", label: "Name"},
        {name: "email", label: "Email"},
        {name: "rating", label: "Rating"},
        {name: "phone", label: "Phone"},
        {name: "emiratesId", label: "Emirates ID"},
        {name: "zone", label: "Zone"},
        {name: "duty.name", label: "Duty"},
    ];
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const handleRowClick = (userId) => {
        setSelectedUserId(userId);
        setDrawerOpen(true);
    };
    const inputs = [
        {
            data: {id: "rating", type: "text", label: "Rating", helperText: "rate the employee out of 10"},
            pattern: {
                required: {value: true, message: "Please enter a rating"},
                pattern: {
                    value: /^(?:10(?:\.0)?|[0-9](?:\.[0-9])?)$/,
                    message: "Please enter a valid number between 0 and 10"
                }
            }
        }
    ];

    return (
          <div>
              <Box sx={{display: 'flex', gap: 2, mb: 0, p: 2}}>
                  <SearchComponent
                        apiEndpoint="/api/index?id=user&centerId=true"
                        setFilters={setFilters}
                        inputLabel="Search User By EmiratesId"
                        renderKeys={["name", "emiratesId", "email"]}
                        mainKey="emiratesId"
                  />
              </Box>
              <AdminTable
                    withEdit={true}
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
                    editHref="center/employees"
                    editButtonText="Edit Rating"
                    inputs={inputs}
                    extraComponent={({item}) => (
                          <>

                              <Button onClick={() => handleRowClick(item.id)}>View Details</Button>

                          </>
                    )}
              />
              <UserDetailDrawer
                    userId={selectedUserId}
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    setData={setData}
                    isCenter={true}
              />
          </div>
    );

}
