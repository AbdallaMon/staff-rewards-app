"use client";

import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import {useEffect, useState} from "react";
import UserDetailDrawer from "@/app/UiComponents/DataViewer/UserDetailsDrawer";
import {Button} from "@mui/material";
import Link from "next/link";
import FilterSelect from "@/app/UiComponents/FormComponents/FilterSelect";
import {useRouter, useSearchParams} from "next/navigation";

export default function EmployeesRequest() {
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
    } = useDataFetcher("admin/employees/requests", false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [centers, setCenters] = useState([]);
    const searchParams = useSearchParams();
    const selectedCenter = searchParams.get('centerId');
    const router = useRouter();
    const columns = [
        {name: "name", label: "Name"},
        {name: "email", label: "Email"},
        {name: "center.name", label: "Center"},
        {name: "emiratesId", label: "Emirates ID"},
        {name: "duty.name", label: "Duty"},
    ];
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
    const handleRowClick = (userId) => {
        setSelectedUserId(userId);
        setDrawerOpen(true);
    };

    const handleCloseDrawer = () => {
        setDrawerOpen(false);
        setSelectedUserId(null);
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
              <div className={"grid grid-cols-1 md:grid-cols-4 gap-5  items-center justify-between"}>
                  
                  <Link href="/dashboard/staff-requests/rejected" sx={{
                      mt: 2,
                      display: "flex",

                  }}>
                      <Button color="primary">
                          See Rejected Requests
                      </Button>
                  </Link>
                  <Link href="/dashboard/staff-requests/uncompleted" sx={{
                      mt: 2,
                      display: "flex",

                  }}>
                      <Button color="primary">
                          See uncompleted Requests
                      </Button>
                  </Link>
                  <Link href="/dashboard/staff-requests/pending" sx={{
                      mt: 2,
                      display: "flex",

                  }}>
                      <Button color="primary">
                          See pending Requests
                      </Button>
                  </Link>
                  <FilterSelect options={centers} label={"Centers"} onChange={handleCenterChange}
                                loading={centerLoading} value={selectedCenter}/>
              </div>

              <AdminTable
                    withEdit={false}
                    data={data}
                    columns={columns}
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                    total={total}
                    setTotal={setTotal}
                    loading={loading}
                    extraComponent={({item}) => (
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
