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
    const [duties, setDuties] = useState([])
    const searchParams = useSearchParams();
    const selectedCenter = searchParams.get('centerId');
    const router = useRouter();
    const defaultInputs = [
        {data: {id: "centerId", parentId: "center", type: "SelectField", label: "Center", options: [], loading: true}},
        {data: {id: "dutyId", parentId: "duty", type: "SelectField", label: "Duty", options: [], loading: true}},
        {data: {id: "name", type: "text", label: "Name"}},
        {data: {id: "email", type: "text", label: "Email"}},
        {
            data: {id: "emiratesId", type: "number", label: "Emirates ID"},
            pattern: {
                pattern: {
                    value: /^\d{15}$/,
                    message: "Emirates ID must be exactly 15 digits",
                }
            }
        },
        {data: {id: "rating", type: "number", label: "Rating"}},
        {data: {id: "zone", type: "SelectField", label: "Zone", options: emiratesOptions, loading: false},},
        {data: {id: "phone", type: "number", label: "Phone"}},
        {data: {id: "bankName", type: "text", label: "Bank Name"}},
        {data: {id: "bankUserName", type: "text", label: "Bank User Name"}},
        {
            data: {id: "ibanBank", type: "text", label: "IBAN Bank"},
            pattern: {
                pattern: {
                    value: /^AE\d{21}$/,
                    message: "IBAN must start with 'AE' followed by exactly 21 digits",
                },
                maxLength: {
                    value: 23,
                    message: "IBAN must be exactly 23 characters long",
                }
            }
        },
        {data: {id: "graduationName", type: "text", label: "Education"}},
        {data: {id: "passportNumber", type: "text", label: "Passport Number"}}
    ];

    const [inputs, setInputs] = useState(defaultInputs);
    const [loadingInputs, setLoadingInputs] = useState(true);
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
        setDuties(result.data || []);
        setDutiesLoading(false);
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
    const handleDutiesChange = (event) => {
        setSelectedDuty(event.target.value)
    }
    const handleUpdateDuties = (userId, updatedDuties) => {
        setData(prevData =>
              prevData.map(item =>
                    item.id === userId ? {...item, additionalDuties: updatedDuties} : item
              )
        );
    };
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
                    checkChanges={true}
                    loading={loading}
                    editHref={"admin/employees"}
                    extraComponent={({item}) => (
                          <div>
                              <Button onClick={() => handleRowClick(item.id)}>View Details</Button>
                              <AssingNewDutyModal
                                    selectedItem={item}
                                    allDuties={duties}
                                    onUpdate={handleUpdateDuties}
                              />
                          </div>
                    )}
              />
              <UserDetailDrawer
                    userId={selectedUserId}
                    open={drawerOpen}
                    onClose={() => setDrawerOpen(false)}
                    renderExtraButtons
                    setData={setData}
                    admin={true}
              />
          </div>
    );
}
