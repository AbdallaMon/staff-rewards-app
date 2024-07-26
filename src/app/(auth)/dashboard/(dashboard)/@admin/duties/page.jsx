"use client";

import CreateModal from "@/app/UiComponents/Models/CreateModal";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";

export default function Duties() {
    const { data, loading, setData, page, setPage, limit, setLimit, total, setTotal } = useDataFetcher("admin/duties", false);




    const inputs = [
        { data: { id: "name", type: "text", label: "Name" }, pattern: {
                required: {
                    value: true,
                    message: "Please enter a name for the duty",
                }
            }
        }
        ,
        { data: { id: "amount", type: "number", label: "Amount" }, pattern: {
                required: {
                    value: true,
                    message: "Please enter an amount for the duty",
                },
                pattern: {
                    value: /^[1-9]\d*$/,
                    message: "Min value is 1"
                }
            }
        }
    ];

    const columns = [
        { name: "name", label: "Name" },
        { name: "amount", label: "Amount" }
    ];

    return (
          <div >

              <CreateModal
                    setData={setData}
                    label={"New Duty"}
                    inputs={inputs}
                    href="admin/duties"
                    extraProps={{ formTitle: "Create New Duty", btnText: "Submit" }}
                    setTotal={setTotal}
              />
              <AdminTable
                    withEdit={true}
                    withDelete={true}
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
                    editHref={"admin/duties"}
                    deleteHref={"admin/duties"}
              />
          </div>
    );
}
