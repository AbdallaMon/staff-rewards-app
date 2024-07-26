"use client"
import {BasicTabs} from "@/app/UiComponents/DataViewer/BasicTabs";
import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import CreateModal from "@/app/UiComponents/Models/CreateModal";
import {useState} from "react";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";

export default function Admin() {
  const { data, loading, setData, page, setPage, limit, setLimit, total } = useDataFetcher("admin/shifts", false);

  const defaultInputs = [
    { data: { id: "name", type: "text", label: "Name" } },
    { data: { id: "duration", type: "number", label: "Duration (hours)" } }
  ];

  const [inputs, setInputs] = useState(defaultInputs);

  const columns = [
    { name: "name", label: "Name" },
    { name: "duration", label: "Duration (hours)" }
  ];

  return <div>
    <BasicTabs section="admin" />
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
