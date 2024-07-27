import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, CircularProgress, Box } from '@mui/material';

const FilterSelect = ({ label, options, value, onChange, loading }) => {
    return (
          <div className={"w-full flex justify-end px-2"}>

              <FormControl  variant="outlined" margin="normal" sx={{
                  mb:2,
                  width: {
                      xs: '100%',
                      sm: 200,
                  },
              }}>
                  <InputLabel>{label}</InputLabel>
                  <Select
                        value={options?.find((option) => option.id == value)?.name || 'All '}
                        onChange={onChange}
                        label={label}
                        disabled={loading}
                        renderValue={(selected) => {
                            if (loading) {
                                return (
                                      <Box display="flex" alignItems="center">
                                          <CircularProgress size={20} sx={{ marginRight: 2 }} />
                                          <span>Loading...</span>
                                      </Box>
                                );
                            }
                            return selected || 'All';
                        }}
                  >
                      <MenuItem value="">All</MenuItem>
                      {options.map((option) => (
                            <MenuItem key={option.id} value={option.id} >
                                {option.name}
                            </MenuItem>
                      ))}
                  </Select>
              </FormControl>
          </div>
    );
};

export default FilterSelect;
