"use client";

import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import {useEffect, useState} from "react";
import UserDetailDrawer from "@/app/UiComponents/DataViewer/UserDetailsDrawer";
import {Button, FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {useRouter, useSearchParams} from "next/navigation";
import FilterSelect from "@/app/UiComponents/FormComponents/FilterSelect";
import {emiratesOptions} from "@/app/constants";
import SearchComponent from "@/app/UiComponents/FormComponents/SearchComponent";
import AssingNewDutyModal from "@/app/UiComponents/Models/AssingNewDutyModal";

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
    } = useDataFetcher("finincal/employees", false);
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
    const [duties, setDuties] = useState([])
    const searchParams = useSearchParams();
    const selectedCenter = searchParams.get('centerId');
    const router = useRouter();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [centerLoading, setCenterLoading] = useState(true);
    const [dutiesLoading, setDutiesLoading] = useState(false)
    const [selectedDuty, setSelectedDuty] = useState(null)
    useEffect(() => {
        setFilters({centerId: selectedCenter, dutyId: selectedDuty});
    }, [selectedCenter, selectedDuty])

    async function fetchCenters() {
        setCenterLoading(true);
        const response = await fetch("/api/index?id=center");
        const result = await response.json();
        setCenters(result.data || []);
        setCenterLoading(false);
    }

    async function fetchDuties() {
        const response = await fetch("/api/index?id=duty");
        const result = await response.json();
        setDuties(result.data || []);
        setDutiesLoading(false);

    }

    async function handleFetchSelectItem() {
        await fetchCenters();
        await fetchDuties();
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
    const handleDutiesChange = (event) => {
        setSelectedDuty(event.target.value)
    }
    return (
          <div>
              <div className={"flex flex-wrap gap-4 items-center px-3"}>
                  <div>
                      <SearchComponent
                            apiEndpoint="/api/index?id=user"
                            setFilters={setFilters}
                            inputLabel="Search User By EmiratesId"
                            renderKeys={["name", "emiratesId", "email"]}
                            mainKey="emiratesId"
                      />
                  </div>
                  <div>
                      <FilterSelect options={centers} label={"Centers"} onChange={handleCenterChange}
                                    loading={centerLoading}
                                    value={selectedCenter}/>
                  </div>
                  <div>

                      <FilterSelect options={duties} label={"Duties"} onChange={handleDutiesChange}
                                    loading={dutiesLoading}
                                    value={selectedDuty}/>
                  </div>
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
                    checkChanges={true}
                    loading={loading}
                    extraComponent={({item}) => (
                          <div>
                              <Button onClick={() => handleRowClick(item.id)}>View Details</Button>
                          </div>
                    )}
              />
              <UserDetailDrawer
                    userId={selectedUserId}
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    setData={setData}
                    financial={true}
              />
          </div>
    );
}
