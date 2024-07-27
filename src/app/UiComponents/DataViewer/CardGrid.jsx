import React, { useState } from 'react';
import {
    Box,
    Button,
    CircularProgress,
    FormControl,
    MenuItem,
    Pagination,
    Select,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Backdrop,
    Paper
} from '@mui/material';
import EditModal from "@/app/UiComponents/Models/EditModal";
import DeleteModal from "@/app/UiComponents/Models/DeleteModal";
import dayjs from 'dayjs';
import CalendarComponent from "@/app/UiComponents/DataViewer/CalenderComponent";

export default function AdminTable({
                                       data,
                                       columns,
                                       page,
                                       setPage,
                                       limit,
                                       setLimit,
                                       total,
                                       setData,
                                       inputs,
                                       loading,
                                       withEdit,
                                       editHref,
                                       withDelete,
                                       deleteHref,
                                       withArchive,
                                       archiveHref,
                                       extraComponent: ExtraComponent,
                                       extraComponentProps,
                                       setTotal,
                                       checkChanges,
                                       isCalendar,
                                       setFilters,
                                       labelKey,
                                       editButtonText = "Edit" // Default value is "Edit"
                                   }) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [archiveOpen, setArchiveOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const handleEditOpen = (item) => {
        setSelectedItem(item);
        setEditOpen(true);
    };

    const handleEditClose = () => {
        setEditOpen(false);
        setSelectedItem(null);
    };

    const handleDeleteOpen = (item) => {
        setSelectedItem(item);
        setDeleteOpen(true);
    };

    const handleDeleteClose = () => {
        setDeleteOpen(false);
        setSelectedItem(null);
    };

    const handleArchiveOpen = (item) => {
        setSelectedItem(item);
        setArchiveOpen(true);
    };

    const handleArchiveClose = () => {
        setArchiveOpen(false);
        setSelectedItem(null);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleLimitChange = (event) => {
        const newLimit = parseInt(event.target.value, 10);
        setLimit(newLimit);

        const newPage = Math.min(page, Math.ceil(total / newLimit));
        setPage(newPage);
    };

    const totalPages = Math.ceil(total / limit);

    const getPropertyValue = (item, propertyPath) => {
        const value = propertyPath.split('.').reduce((acc, part) => acc && acc[part], item);
        if (propertyPath.toLowerCase().includes('date') && dayjs(value).isValid()) {
            return dayjs(value).format('YYYY-MM-DD');
        }
        return value;
    };

    return (
          <Box sx={{ padding: '16px' }}>
              {isCalendar ? (
                    <CalendarComponent
                          data={data}
                          labelKey={labelKey}
                          setFilters={setFilters}
                          withEdit={withEdit}
                          withDelete={withDelete}
                          withArchive={withArchive}
                          onEdit={handleEditOpen}
                          onDelete={handleDeleteOpen}
                          onArchive={handleArchiveOpen}
                    />
              ) : (
                    <>
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        {columns.map((column) => (
                                              <TableCell key={column.name} sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>
                                                  {column.label}
                                              </TableCell>
                                        ))}
                                        {withEdit && <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>{editButtonText}</TableCell>}
                                        {withDelete && <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Delete</TableCell>}
                                        {withArchive && <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Archive</TableCell>}
                                        {ExtraComponent && <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f0f0f0' }}>Extra</TableCell>}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {data?.map((item) => (
                                          <TableRow key={item.id}>
                                              {columns.map((column) => (
                                                    <TableCell key={column.name}>
                                                        {getPropertyValue(item, column.name)}
                                                    </TableCell>
                                              ))}
                                              {withEdit && (
                                                    <TableCell>
                                                        <Button
                                                              variant="contained"
                                                              color="primary"
                                                              onClick={() => handleEditOpen(item)}
                                                              sx={{ textTransform: 'none' }}
                                                        >
                                                            {editButtonText}
                                                        </Button>
                                                    </TableCell>
                                              )}
                                              {withDelete && (
                                                    <TableCell>
                                                        <Button
                                                              variant="contained"
                                                              color="secondary"
                                                              onClick={() => handleDeleteOpen(item)}
                                                              sx={{ textTransform: 'none' }}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </TableCell>
                                              )}
                                              {withArchive && (
                                                    <TableCell>
                                                        <Button
                                                              variant="contained"
                                                              color="warning"
                                                              onClick={() => handleArchiveOpen(item)}
                                                              sx={{ textTransform: 'none' }}
                                                        >
                                                            Archive
                                                        </Button>
                                                    </TableCell>
                                              )}
                                              {ExtraComponent && (
                                                    <TableCell>
                                                        <ExtraComponent
                                                              item={item}
                                                              setData={setData}
                                                              {...extraComponentProps}
                                                        />
                                                    </TableCell>
                                              )}
                                          </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginTop: '16px',
                            flexDirection: 'row-reverse'
                        }}>
                            <Pagination
                                  count={totalPages}
                                  page={page}
                                  onChange={handlePageChange}
                                  color="primary"
                            />
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Typography variant="body2" sx={{ marginRight: '8px' }}>
                                    Number of items per page:
                                </Typography>
                                <FormControl variant="outlined" size="small">
                                    <Select
                                          value={limit}
                                          onChange={handleLimitChange}
                                          sx={{ backgroundColor: 'white' }}
                                    >
                                        {[1, 20, 50, 100].map((size) => (
                                              <MenuItem key={size} value={size}>
                                                  {size}
                                              </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </Box>

                    </>
              )}
              {selectedItem && withEdit && (
                    <EditModal
                          open={editOpen}
                          handleClose={handleEditClose}
                          item={selectedItem}
                          inputs={inputs}
                          setData={setData}
                          href={editHref}
                          checkChanges={checkChanges}
                    />
              )}
              {selectedItem && withDelete && (
                    <DeleteModal
                          open={deleteOpen}
                          handleClose={handleDeleteClose}
                          item={selectedItem}
                          setData={setData}
                          href={deleteHref}
                          setTotal={setTotal}
                    />
              )}
              {selectedItem && withArchive && (
                    <DeleteModal
                          open={archiveOpen}
                          handleClose={handleArchiveClose}
                          item={selectedItem}
                          setData={setData}
                          href={archiveHref}
                          setTotal={setTotal}
                          archive={true}
                    />
              )}
              <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
                  <CircularProgress color="inherit" />
              </Backdrop>
          </Box>
    );
}
