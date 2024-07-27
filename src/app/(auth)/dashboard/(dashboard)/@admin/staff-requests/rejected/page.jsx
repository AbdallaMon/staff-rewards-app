"use client";

import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import { useState } from "react";
import UserDetailDrawer from "@/app/UiComponents/DataViewer/UserDetailsDrawer";
import {Button} from "@mui/material";

export default function EmployeesRequest() {
    const { data, loading, setData, page, setPage, limit, setLimit, total, setTotal } = useDataFetcher("admin/employees/rejected", false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const columns = [
        { name: "name", label: "Name" },
        { name: "email", label: "Email" },
        { name: "center.name", label: "Center" },
        { name: "emiratesId", label: "Emirates ID" },
        { name: "duty.name", label: "Duty" },
        { name: "rejectedReason", label: "Rejected Reason" },
    ];

    const handleRowClick = (userId) => {
        setSelectedUserId(userId);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedUserId(null);
    };

    return (
          <div>
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
                    loading={loading}
                    extraComponent={({ item }) => (
                          <Button onClick={() => handleRowClick(item.id)}>Edit Request</Button>
                    )}
              />
              {selectedUserId && (
                    <UserDetailDrawer
                          userId={selectedUserId}
                          open={drawerOpen}
                          onClose={handleCloseDrawer}
                          renderExtraButtons
                          setData={setData}
                    />
              )}
          </div>
    );
}
