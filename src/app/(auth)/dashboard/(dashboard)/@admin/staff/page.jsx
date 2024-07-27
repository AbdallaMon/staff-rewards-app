"use client";

import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import {useEffect, useState} from "react";
import UserDetailDrawer from "@/app/UiComponents/DataViewer/UserDetailsDrawer";
import {Button} from "@mui/material";

export default function STAFF() {
    const { data, loading, setData, page, setPage, limit, setLimit, total, setTotal } = useDataFetcher("admin/employees", false);
    const columns = [
        { name: "name", label: "Name" },
        { name: "email", label: "Email" },
        { name: "center.name", label: "Center" },
        { name: "rating", label: "Rating" },
        {name:"emiratesId",label:"Emirates ID"},
        { name: "totalRewards", label: "Total Rewards" },
        { name: "duty.name", label: "Duty" },
    ];

    const defaultInputs = [
        { data: { id: "centerId",parentId:"center", type: "SelectField", label: "Center",    options: [], loading: true, }},
        { data: { id: "dutyId", parentId:"duty",type: "SelectField", label: "Duty" , options: [], loading: true, }}
    ];
    const [inputs, setInputs] = useState(defaultInputs);
    const [loadingInputs, setLoadingInputs] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

    async function fetchCenters() {
        const response = await fetch("/api/index?id=center");
        const result = await response.json();
        const newInputs = [...inputs];
        newInputs[0].data.options = result.data?.map((item) => ({
            value: item.name,
            id: item.id,
        }));
        newInputs[0].data.loading = false;
        setInputs(newInputs);
    }
    async function fetchDuties() {
        const response = await fetch("/api/index?id=duty");
        const result = await response.json();

        const newInputs = [...inputs];
        newInputs[1].data.options = result.data?.map((item) => ({
            value: item.name,
            id: item.id,
        }));
        newInputs[1].data.loading = false;
        setInputs(newInputs);
    }
     async function handleFetchSelectItem(){
         setLoadingInputs(true);
     await   fetchCenters();
         await   fetchDuties();
         setLoadingInputs(false);
     }
    useEffect(()=>{
        handleFetchSelectItem();
    },[])
    const handleRowClick = (userId) => {
        setSelectedUserId(userId);
        setDrawerOpen(true);
    };

    return (
          <div>
              <AdminTable
                    withEdit={!loadingInputs}
                    withDelete={false}
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
                    deleteHref={null}
                    editHref={"admin/employees"}
                    extraComponent={({ item }) => (
                          <Button onClick={() => handleRowClick(item.id)}>View Details</Button>
                    )}
              />
              <UserDetailDrawer
                    userId={selectedUserId}
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
              />
          </div>
    );
}
