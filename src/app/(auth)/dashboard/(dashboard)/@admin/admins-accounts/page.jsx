"use client";

import CreateModal from "@/app/UiComponents/Models/CreateModal";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import {emiratesOptions} from "@/app/constants";

export default function Centers() {
    const {
        data,
        loading,
        setData,
        page,
        setPage,
        limit,
        setLimit,
        total,
        setTotal
    } = useDataFetcher("admin/accounts", false);
    const inputs = [
        {
            data: {id: "name", type: "text", label: "Name"}, pattern: {
                required: {
                    value: true,
                    message: "Please enter a name for the center",
                }
            }
        },

        {
            data: {id: "email", type: "email", label: "Email"}, pattern: {
                required: {
                    value: true,
                    message: "Please enter an email",
                },
                pattern: {
                    value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Please enter a valid email",
                }
            }
        },

    ];

    const columns = [
        {name: "name", label: "Name"},
        {name: "email", label: "Email"},
    ];


    return (
          <div>
              <CreateModal
                    setData={setData}
                    label={"New financial account"}
                    inputs={inputs}
                    href="admin/accounts"
                    extraProps={{formTitle: "Create New financial account", btnText: "Submit"}}
                    setTotal={setTotal}
              />
              <AdminTable
                    data={data}
                    columns={columns}
                    page={page}
                    setPage={setPage}
                    limit={limit}
                    setLimit={setLimit}
                    total={total}
                    setTotal={setTotal}
                    withEdit={true}
                    inputs={inputs}
                    setData={setData}
                    loading={loading}
                    editHref={"admin/accounts"}
                    deleteHref={"admin/accounts"}
                    checkChanges={true}
                    withDelete={true}
              />
          </div>
    );
}
