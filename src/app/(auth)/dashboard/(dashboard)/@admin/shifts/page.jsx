"use client"
import {BasicTabs} from "@/app/UiComponents/DataViewer/BasicTabs";
import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import CreateModal from "@/app/UiComponents/Models/CreateModal";
import {useState} from "react";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";

export default function Shifts() {
    const { data, loading, setData, page, setPage, limit, setLimit, total } = useDataFetcher("admin/shifts", false);

    const inputs = [
        { data: { id: "name", type: "text", label: "Name" } , pattern: {
                required: {
                    value: true,
                    message: "Please enter a name for the shift",
                }
            }
            },
        { data: { id: "duration", type: "number", label: "Duration (hours)" } ,
        pattern: {
            required: {
                value: true,
                message: "Please enter a duration for the shift",
            },
            pattern:{
                value: /[1-9]/gi,
                message: "Min value is 1"
            }
        }

        }
    ];


    const columns = [
        { name: "name", label: "Name" },
        { name: "duration", label: "Duration (hours)" }
    ];

    return <div>
        <CreateModal
              setData={setData}
              label={"New Shift"}
              inputs={inputs}
              href="/api/admin/shifts"
              extraProps={{ formTitle: "Create New Shift", btnText: "Submit" }}
              sendAsFiles={true}
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
              inputs={inputs}
              setData={setData}
              loading={loading}
              editHref={"/api/admin/shifts"}
              deleteHref={"/api/admin/shifts"}
        />
    </div>;
}
