import {Box, TextField} from "@mui/material";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {AdapterDayjs} from "@mui/x-date-pickers/AdapterDayjs";
import {DatePicker} from "@mui/x-date-pickers/DatePicker";

export default function RangeDateComponent(
      {
            startDate,
            endDate,
            handleStartDateChange,
            handleEndDateChange
      }
){
    return(
          <Box sx={{ display: 'flex', justifyContent: 'space-center', alignItems: 'center', mb: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                  <DatePicker
                        label="Start Date"
                        value={startDate}
                        onChange={handleStartDateChange}
                        renderInput={(params) => <TextField {...params} />}
                  />
                  <Box sx={{ mx: 2 }}> to </Box>
                  <DatePicker
                        label="End Date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        renderInput={(params) => <TextField {...params} />}
                  />
              </LocalizationProvider>
          </Box>
    )
}