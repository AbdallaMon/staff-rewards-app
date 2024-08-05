"use client";

import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import {useEffect, useState} from "react";
import UserDetailDrawer from "@/app/UiComponents/DataViewer/UserDetailsDrawer";
import {Button, FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {useRouter, useSearchParams} from "next/navigation";
import FilterSelect from "@/app/UiComponents/FormComponents/FilterSelect";

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
    } = useDataFetcher("admin/employees", false);
    const columns = [
        {name: "name", label: "Name"},
        {name: "email", label: "Email"},
        {name: "center.name", label: "Center"},
        {name: "rating", label: "Rating"},
        {name: "emiratesId", label: "Emirates ID"},
        {name: "totalRewards", label: "Total Rewards"},
        {name: "duty.name", label: "Duty"},
    ];
    const [centers, setCenters] = useState([]);
    const searchParams = useSearchParams();
    const selectedCenter = searchParams.get('centerId');
    const router = useRouter();
    const defaultInputs = [
        {data: {id: "centerId", parentId: "center", type: "SelectField", label: "Center", options: [], loading: true,}},
        {data: {id: "dutyId", parentId: "duty", type: "SelectField", label: "Duty", options: [], loading: true,}}
    ];
    const [inputs, setInputs] = useState(defaultInputs);
    const [loadingInputs, setLoadingInputs] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
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

    async function handleFetchSelectItem() {
        setLoadingInputs(true);
        await fetchCenters();
        await fetchDuties();
        setLoadingInputs(false);
    }

    useEffect(() => {
        handleFetchSelectItem();
    }, [])
    const handleRowClick = (userId) => {
        setSelectedUserId(userId);
        setDrawerOpen(true);
    };
    const handleCenterChange = (event) => {
        const centerId = event.target.value;
        const params = new URLSearchParams(searchParams);
        if (centerId) {
            params.set('centerId', centerId);
        } else {
            params.delete('centerId');
        }
        router.push(`?${params.toString()}`);
    };
    return (
          <div>

              <FilterSelect options={centers} label={"Centers"} onChange={handleCenterChange} loading={centerLoading}
                            value={selectedCenter}/>
              <AdminTable
                    withEdit={!loadingInputs}
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
                    editHref={"admin/employees"}
                    extraComponent={({item}) => (
                          <Button onClick={() => handleRowClick(item.id)}>View Details</Button>
                    )}
              />
              <UserDetailDrawer
                    userId={selectedUserId}
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    renderExtraButtons
                    setData={setData}
              />
          </div>
    );
}
