import { FormControl, FormHelperText, InputLabel, Select } from "@mui/material";
import { useState } from "react";
import MenuItem from "@mui/material/MenuItem";

export default function SelectField({
  select,
  variant = "filled",
  register,
  errors,
}) {
  const selectData = select.data;
  const options = selectData.options;
  const [value, setValue] = useState(selectData.defaultValue||"");

  const handleChange = (event) => {
    setValue(event.target.value);
  };

  return (
    <FormControl
      variant={variant}
      sx={select.sx ? select.sx : { minWidth: 120, width: "100%", mb: 2 }}
      error={Boolean(errors[selectData.id])}
    >
      <InputLabel id={selectData.label}>{selectData.label}</InputLabel>
      <Select
        {...register(selectData.id, select.pattern)}
        {...selectData}
        value={value}
        onChange={handleChange}
      >
        {options.map((item) => {
          return (
            <MenuItem value={item.id} key={item.id}>
              {item.value}
            </MenuItem>
          );
        })}
      </Select>
      <FormHelperText>{errors[selectData.id]?.message}</FormHelperText>
    </FormControl>
  );
}
