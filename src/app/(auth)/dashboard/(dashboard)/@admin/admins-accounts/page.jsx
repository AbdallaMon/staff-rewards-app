"use client";

import CreateModal from "@/app/UiComponents/Models/CreateModal";
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import {emiratesOptions, simpleModalStyle} from "@/app/constants";
import {Box, Button, Fade, Modal} from "@mui/material";
import React, {useState} from "react";
import {Form} from "@/app/UiComponents/FormComponents/Forms/Form";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import {useToastContext} from "@/providers/ToastLoadingProvider";

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
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const {setLoading: setSubmitLoading} = useToastContext()
    const handleRowClick = (userId) => {
        setSelectedUserId(userId);
        setOpenModal(true);
    };

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

    async function onSubmit(data) {
        const result = await handleRequestSubmit(data, setSubmitLoading, `admin/accounts/${selectedUserId}`, false, "Creating...");
        if (result.status === 200) {
            setOpenModal(false)
        }
    }

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
                    extraComponent={({item}) => (
                          <Button onClick={() => handleRowClick(item.id)}>Create new password</Button>
                    )}
              />
              {openModal && <Modal
                    open={openModal}
                    onClose={() => setOpenModal(false)}
                    sx={{
                        z: 999,
                    }}
              >
                  <Fade in={open}>
                      <Box sx={{...simpleModalStyle}}>
                          <Form
                                onSubmit={onSubmit}
                                inputs={[{
                                    data: {id: "password", type: "password", label: "Password"}, pattern: {
                                        required: {
                                            value: true,
                                            message: "Please enter an Password",
                                        },
                                    }
                                }
                                ]}
                                btnText={"Submit"}
                                formTitle={"New password"}
                          >
                          </Form>
                      </Box>
                  </Fade>
              </Modal>
              }
          </div>
    );
}
