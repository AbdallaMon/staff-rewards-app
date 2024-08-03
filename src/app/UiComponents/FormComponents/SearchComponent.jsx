"use client";

import React, {useState, useEffect} from "react";
import {TextField, Box, CircularProgress} from "@mui/material";
import Autocomplete from '@mui/material/Autocomplete';
import debounce from "lodash.debounce";

const SearchComponent = ({apiEndpoint, setFilters, inputLabel, renderKeys, mainKey, resetTrigger}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchSearchResults = async (query) => {
        setLoading(true);
        try {
            const response = await fetch(`${apiEndpoint}&query=${query}`);
            const result = await response.json();
            setSearchResults(result.data);
        } catch (error) {
            console.error("Error fetching search results:", error);
        } finally {
            setLoading(false);
        }
    };

    const debouncedFetchSearchResults = debounce(fetchSearchResults, 500);

    useEffect(() => {
        if (searchTerm) {
            debouncedFetchSearchResults(searchTerm);
        } else {
            setSearchResults([]);
        }
    }, [searchTerm]);

    const handleSelect = (event, newValue) => {
        setSelectedItem(newValue);
        if (newValue) {
            setSearchTerm(newValue[mainKey] || "");
            setFilters((prevFilters) => ({...prevFilters, userId: newValue.id, duty: newValue.duty}));
        } else {
            setSearchTerm("");
            setFilters((prevFilters) => ({...prevFilters, userId: null}));
        }
    };

    useEffect(() => {
        if (resetTrigger !== null && resetTrigger !== undefined) {
            setSearchTerm("");
            setSelectedItem(null);
        }
    }, [resetTrigger]);

    return (
          <Box sx={{position: "relative"}}>
              <Autocomplete
                    options={searchResults}
                    getOptionLabel={(option) => renderKeys.map((key) => option[key]).join(" - ")}
                    loading={loading}
                    value={selectedItem}
                    sx={{
                        minWidth: 300,
                    }}
                    onChange={handleSelect}
                    onInputChange={(event, newInputValue) => {
                        setSearchTerm(newInputValue);
                    }}
                    renderInput={(params) => (
                          <TextField
                                {...params}
                                label={inputLabel}
                                variant="outlined"
                                fullWidth
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                          <>
                                              {loading ? <CircularProgress color="inherit" size={20}/> : null}
                                              {params.InputProps.endAdornment}
                                          </>
                                    ),
                                }}
                          />
                    )}
              />
          </Box>
    );
};

export default SearchComponent;
