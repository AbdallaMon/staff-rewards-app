"use client";

import CreateModal from "@/app/UiComponents/Models/CreateModal";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import {emiratesOptions} from "@/app/constants";

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
      { data: { id: "zone", type: "SelectField", label: "Zone", options: emiratesOptions, loading: false }, pattern: {
              required: {
                  value: true,
                  message: "Please select a zone",
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
    { data: { id: "password", type: "password", label: "Password",helperText:"Password must contain at least 8 characters, including at least one letter and one number"
        }, pattern: {
        required: {
          value: true,
          message: "Please enter a password",
        },
        pattern: {
            value: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/,
            message: "Password must contain at least 8 characters, including at least one letter and one number",
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
    editInputs.map((input) => {
        if (input.data.id === "password") {
            input.pattern={}
                 }
        return input;
    }
    );
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
                checkChanges={true}
          />
        </div>
  );
}
