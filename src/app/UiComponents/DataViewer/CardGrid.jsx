import React, { useState, useEffect } from 'react';
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
    Backdrop
} from '@mui/material';
import EditModal from "@/app/UiComponents/Models/EditModal";
import DeleteModal from "@/app/UiComponents/Models/DeleteModal";

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
                                       extraComponent: ExtraComponent,
                                       extraComponentProps
                                   }) {
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
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

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleLimitChange = (event) => {
        const newLimit = parseInt(event.target.value, 10);
        setLimit(newLimit);

        // Calculate the new page number to stay within bounds
        const newPage = Math.min(page, Math.ceil(total / newLimit));
        setPage(newPage);
    };

    const totalPages = Math.ceil(total / limit);

    const getPropertyValue = (item, propertyPath) => {
        return propertyPath.split('.').reduce((acc, part) => acc && acc[part], item);
    };

    return (
          <Box sx={{ padding: '16px' }}>
              <TableContainer>
                  <Table>
                      <TableHead>
                          <TableRow>
                              {columns.map((column) => (
                                    <TableCell key={column.name}>{column.label}</TableCell>
                              ))}
                              {withEdit && <TableCell>Edit</TableCell>}
                              {withDelete && <TableCell>Delete</TableCell>}
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
                                              >
                                                  Edit
                                              </Button>
                                          </TableCell>
                                    )}
                                    {withDelete && (
                                          <TableCell>
                                              <Button
                                                    variant="contained"
                                                    color="secondary"
                                                    onClick={() => handleDeleteOpen(item)}
                                              >
                                                  Delete
                                              </Button>
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
              {selectedItem && withEdit && (
                    <EditModal
                          open={editOpen}
                          handleClose={handleEditClose}
                          item={selectedItem}
                          inputs={inputs}
                          setData={setData}
                          href={editHref}
                    />
              )}
              {selectedItem && withDelete && (
                    <DeleteModal
                          open={deleteOpen}
                          handleClose={handleDeleteClose}
                          item={selectedItem}
                          setData={setData}
                          href={deleteHref}
                    />
              )}
              <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={loading}>
                  <CircularProgress color="inherit" />
              </Backdrop>
          </Box>
    );
};
