"use client";

import CreateModal from "@/app/UiComponents/Models/CreateModal";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";

export default function Centers() {
  const { data, loading, setData, page, setPage, limit, setLimit, total, setTotal } = useDataFetcher("admin/centers", false);

  const inputs = [
    { data: { id: "name", type: "text", label: "Name" }, pattern: {
        required: {
          value: true,
          message: "Please enter a name for the center",
        }
      }
    },
    { data: { id: "centerId", type: "text", label: "Center ID" }, pattern: {
        required: {
          value: true,
          message: "Please enter a Center ID",
        }
      }
    },
    { data: { id: "zone", type: "text", label: "Zone" }, pattern: {
        required: {
          value: true,
          message: "Please enter a zone",
        }
      }
    },
    { data: { id: "email", type: "email", label: "Email" }, pattern: {
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
    { data: { id: "password", type: "password", label: "Password" }, pattern: {
        required: {
          value: true,
          message: "Please enter a password",
        }
      }
    },
    { data: { id: "supervisorEmail", type: "email", label: "Supervisor Email" }, pattern: {
        required: {
          value: true,
          message: "Please enter a supervisor email",
        },
        pattern: {
          value: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
          message: "Please enter a valid email",
        }
      }
    }
  ];

  const columns = [
    { name: "name", label: "Name" },
    { name: "centerId", label: "Center ID" },
    { name: "zone", label: "Zone" },
    { name: "email", label: "Email" },
    { name: "supervisorEmail", label: "Supervisor Email" }
  ];
const editInputs = [...inputs]
    editInputs.splice(4, 1)
  return (
        <div >
          <CreateModal
                setData={setData}
                label={"New Center"}
                inputs={inputs}
                href="admin/centers"
                extraProps={{ formTitle: "Create New Center", btnText: "Submit" }}
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
                inputs={editInputs}
                setData={setData}
                loading={loading}
                editHref={"admin/centers"}
                deleteHref={"admin/centers"}
                checkChanges={true}
          />
        </div>
  );
}
