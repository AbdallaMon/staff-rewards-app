"use client";

import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";

export default function STAFF() {
    const { data, loading, setData, page, setPage, limit, setLimit, total, setTotal } = useDataFetcher("admin/employees", false);

    const columns = [
        { name: "name", label: "Name" },
        { name: "email", label: "Email" },
        { name: "center.name", label: "Center" },
        { name: "ratings", label: "Ratings" },
        { name: "totalRewards", label: "Total Rewards" }

    ];

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
                    setData={setData}
                    loading={loading}
                    editHref={null}
                    deleteHref={null}
              />
          </div>
    );
}
