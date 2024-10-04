"use client"
import useDataFetcher from "@/helpers/hooks/useDataFetcher";
import {
    Alert,
    Avatar, Box,
    Button,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText, Snackbar,
    Typography
} from "@mui/material";
import Link from "next/link";
import AdminTable from "@/app/UiComponents/DataViewer/CardGrid";
import DrawerWithContent from "@/app/UiComponents/Models/DrawerWithContent";
import CreateOrEditAssignment from "@/app/UiComponents/FormComponents/CreateAssignment";
import AssingNewDutyModal from "@/app/UiComponents/Models/AssingNewDutyModal";
import {Fragment, useEffect, useState} from "react";
import FullScreenLoader from "@/app/UiComponents/Feedback/FullscreenLoader";
import {useToastContext} from "@/providers/ToastLoadingProvider";
import {handleRequestSubmit} from "@/helpers/functions/handleSubmit";
import SearchComponent from "@/app/UiComponents/FormComponents/SearchComponent";
import {BsPerson} from "react-icons/bs";
import {MdDelete} from "react-icons/md";
import {getData} from "@/helpers/functions/getData";

export default function Assignments() {
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
    } = useDataFetcher("admin/assignments", false);

    const columns = [
        {name: "title", label: "Title"},
        , {name: "_count.duties", label: "Number of duties assigned"}
    ];


    return (
          <div>
              <div className={"flex flex-wrap gap-5 items-center my-2 bg-bgSecondary w-full py-2 px-2"}>
                  <Button component={Link} href={"/dashboard/configure/duties"} variant="outlined">
                      Configure Duty
                  </Button>
                  <Button component={Link} href={"/dashboard/configure/calendar"} variant="outlined">
                      Configure Calendar
                  </Button>
                  <div className={"px-2"}>
                      <DrawerWithContent
                            component={CreateOrEditAssignment}
                            extraData={{label: "Create new assessment", setData}}
                            variant="contained"

                      />
                  </div>
              </div>
              <AdminTable
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
                    setFilters={setFilters}
                    extraComponent={({item}) => (
                          <div className={"flex gap-5"}>
                              <DrawerWithContent
                                    component={Assignment}
                                    variant="contained"
                                    extraData={{label: "Edit assessment", setData, id: item.id}}
                              />
                              <DrawerWithContent
                                    component={DutiesSelectorWithAction}
                                    extraData={{label: "Assign duty to this assessment"}}
                                    item={item}
                              />
                          </div>
                    )}

              />
          </div>
    )
}

export function Assignment({id, onClose, setData}) {
    const [loading, setLoading] = useState(true)
    const [assignmentData, setAssignmentData] = useState(null)

    useEffect(() => {
        async function getAssignmentById() {
            const request = await fetch(`/api/admin/assignments/${id}`)
            const response = await request.json()
            setAssignmentData(response.data)
            setLoading(false)
        }

        getAssignmentById()
    }, [id])


    if (loading) return <FullScreenLoader/>
    if (!loading && !assignmentData) return <Typography>Some thing wrong happened</Typography>
    return <CreateOrEditAssignment setData={setData} initialAssignment={assignmentData} isEdit={true}
                                   onClose={onClose}/>
}

const DutiesSelectorWithAction = ({label, item}) => {
    const [duties, setDuties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [snackbarMessage, setSnackbarMessage] = useState(null);
    const [snackbarSeverity, setSnackbarSeverity] = useState("success");
    const [selectedDuty, setSelectedDuty] = useState(null);
    const {loading: submitLoading, setLoading: setSubmitLoading} = useToastContext()
    useEffect(() => {
        async function handleAssignment(user) {
            const checkIsExist = duties?.find((u) => u.id === user.id)
            if (checkIsExist) {
                setSnackbarMessage("This duty already assigned to this assessment")
                setSnackbarSeverity("error")
                return
            }
            const request = await handleRequestSubmit(selectedDuty, setSubmitLoading, `admin/assignments/${item.id}/duties`, null, "Adding assigment to a duty",)
            if (request.status === 200) {
                setDuties((duties) => ([...duties, selectedDuty]))
            }
        }

        if (selectedDuty) {
            handleAssignment(selectedDuty)
        }
    }, [selectedDuty])
    useEffect(() => {
        const fetchGrantUsers = async () => {
            const response = await getData({url: `admin/assignments/${item.id}/duties`, setLoading})
            setDuties(response.data);
        }
        fetchGrantUsers();
    }, []);

    const handleDelete = async (dutyId) => {
        const request = await handleRequestSubmit({dutyId}, setSubmitLoading, `admin/assignments/${item.id}/duties`, null, "Removing duty from assignment", null, "DELETE")
        if (request.status === 200) {
            setDuties((prevUsers) => prevUsers.filter((duty) => duty.id !== dutyId));
            setSnackbarSeverity("success");
            setSnackbarMessage("duty deleted successfuly");
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbarMessage(null);
    };

    return (
          <Box sx={{padding: 2}}>
              {(loading || submitLoading) && <FullScreenLoader/>}
              <Typography variant="h6" gutterBottom>
                  {label}
              </Typography>
              <>
                  <SearchComponent
                        apiEndpoint="/api/index?id=duty"
                        setFilters={setSelectedDuty}
                        inputLabel="Search Duty By name"
                        renderKeys={["name"]}
                        mainKey="name"
                  />
                  <List sx={{
                      backgroundColor: 'background.default',
                      borderRadius: 2,
                      padding: 2,
                      mt: 3,
                      maxWidth: 800,
                      mx: "auto"
                  }}>
                      {duties?.map((duty) => (
                            <Fragment key={duty.id}>
                                <ListItem
                                      secondaryAction={
                                          <IconButton edge="end" aria-label="delete"
                                                      onClick={() => handleDelete(duty.id)}>
                                              <MdDelete sx={{color: "error.main"}}/>
                                          </IconButton>
                                      }
                                >
                                    <ListItemAvatar>
                                        <Avatar sx={{bgcolor: 'primary.main'}}>
                                            <BsPerson/>
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                          primary={<Typography
                                                variant="h6">{duty.name}</Typography>}
                                    />
                                </ListItem>
                                <Divider/>
                            </Fragment>
                      ))}
                  </List>
              </>
              <Snackbar
                    open={!!snackbarMessage}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
              >
                  <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} elevation={6} variant="filled">
                      {snackbarMessage}
                  </Alert>
              </Snackbar>
          </Box>
    );
};

