"use client"
import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import CreateModal from "@/app/UiComponents/Models/CreateModal";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import Link from "next/link";
import {Button} from "@mui/material";

export default function Shifts() {
    const { data, loading, setData, page, setPage, limit, setLimit, total,setTotal } = useDataFetcher("admin/shifts", false);
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
                value:/^[1-9]\d*$/,
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
        <div className={"flex gap-5 my-2 bg-bgSecondary w-fit py-2 px-2"}>
            <Link href={"/dashboard/configure/duties"}>
                <Button variant="outlined">Configure Duties</Button>
            </Link>
            <Link href={"/dashboard/configure/calender"}>
                <Button variant="outlined">Configure calender</Button>
            </Link>
        </div>
        <CreateModal
              setData={setData}
              label={"New Shift"}
              inputs={inputs}
              href="admin/shifts"
              extraProps={{formTitle: "Create New Shift", btnText: "Submit"}}
              sendAsFiles={true}
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
              editHref={"admin/shifts"}
              deleteHref={"admin/shifts"}
        />
    </div>;
}
