"use client";

import React, { useState, useEffect, useRef } from "react";
import { TextField, Box, List, ListItem, ListItemText, CircularProgress, Typography, IconButton, InputAdornment, ClickAwayListener } from "@mui/material";
import debounce from "lodash.debounce";
import { FaTimes } from "react-icons/fa";

const SearchComponent = ({ apiEndpoint, setFilters, inputLabel, renderKeys, mainKey }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [open, setOpen] = useState(false);

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
            setOpen(true);
        } else {
            setSearchResults([]);
            setOpen(false);
        }
    }, [searchTerm]);

    const handleSelect = (item) => {
        setSelectedItem(item);
        setSearchTerm(item[mainKey] || "");
        setFilters((prevFilters) => ({ ...prevFilters, userId: item.id ,duty:item.duty}));
        setSearchResults([]);
        setOpen(false);
    };

    const handleReset = () => {
        setSelectedItem(null);
        setFilters((prevFilters) => ({ ...prevFilters, userId: null }));
        setSearchTerm("");
        setOpen(false);
    };

    const handleClickAway = () => {
        setOpen(false);
    };

    return (
          <ClickAwayListener onClickAway={handleClickAway}>
              <Box sx={{ position: "relative" }}>
                  <TextField
                        label={inputLabel}
                        variant="outlined"
                        fullWidth
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                  <InputAdornment position="end">
                                      {selectedItem && (
                                            <IconButton onClick={handleReset}>
                                                <FaTimes />
                                            </IconButton>
                                      )}
                                  </InputAdornment>
                            ),
                        }}
                        onClick={() => setOpen(true)}
                  />
                  {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                            <CircularProgress />
                        </Box>
                  )}
                  {!loading && searchResults?.length === 0 && searchTerm && (
                        <Typography variant="body2" sx={{ mt: 2, textAlign: 'center' }}>
                            No data found
                        </Typography>
                  )}
                  {open && searchResults?.length > 0 && (
                        <List sx={{ position: "absolute", width: "100%", bgcolor: "background.paper", zIndex: 1, maxHeight: 200, overflowY: 'auto' }}>
                            {searchResults.map((item) => (
                                  <ListItem button key={item.id} onClick={() => handleSelect(item)}>
                                      <ListItemText
                                            primary={renderKeys.map((key) => item[key]).join(" - ")}
                                      />
                                  </ListItem>
                            ))}
                        </List>
                  )}
              </Box>
          </ClickAwayListener>
    );
};

export default SearchComponent;
