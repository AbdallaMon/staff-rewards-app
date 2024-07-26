        import React, { useState } from "react";
        import {
          Box,
          Button,
          FormControl,
          IconButton,
          InputLabel,
          MenuItem,
          Select,
          TextField,
        } from "@mui/material";
        import {MdDeleteForever} from "react-icons/md";

        const AddMultiItem = ({ type, defaultValues = [], onChange }) => {
          const [items, setItems] = useState(defaultValues);

          const handleAddItem = () => {
            setItems([...items, { mediaType: "IMAGE", url: "" }]);
          };

          const handleRemoveItem = (index) => {
            const newItems = items.filter((_, i) => i !== index);
            setItems(newItems);
            onChange(newItems); // Notify parent component
          };

          const handleChange = (index, key, value) => {
            const newItems = items.map((item, i) =>
              i === index ? { ...item, [key]: value } : item
            );
            setItems(newItems);
            onChange(newItems); // Notify parent component
          };

          return (
            <Box>
              {items.map((item, index) => (
                <Box key={index} display="flex" alignItems="center" mb={2}>
                  <FormControl variant="outlined" sx={{ minWidth: 120, mr: 2 }}>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={item.mediaType}
                      onChange={(e) => handleChange(index, "mediaType", e.target.value)}
                      label="Type"
                    >
                      <MenuItem value="IMAGE">Image</MenuItem>
                      <MenuItem value="VIDEO">Video</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    value={item.url}
                    onChange={(e) => handleChange(index, "url", e.target.value)}
                    variant="outlined"
                    placeholder="URL"
                  />
                  <IconButton onClick={() => handleRemoveItem(index)}>
                    <MdDeleteForever />
                  </IconButton>
                </Box>
              ))}
              <Button onClick={handleAddItem} variant="contained" color="primary">
                Add {type === "text" ? "Text" : "Media"}
              </Button>
            </Box>
          );
        };

        export default AddMultiItem;
