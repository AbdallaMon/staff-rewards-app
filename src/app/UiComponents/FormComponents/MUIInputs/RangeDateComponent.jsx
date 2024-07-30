import { Box, TextField } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import "dayjs/locale/en-gb"; // Import the locale you want to use

// Ensure the locale is set to day/month/year
dayjs.locale("en-gb");
export default function RangeDateComponent({
                                               startDate,
                                               endDate,
                                               handleStartDateChange,
                                               handleEndDateChange
                                           }) {
    return (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="en-gb">
                  <DatePicker
                        label="Start Date"
                        value={startDate ? dayjs(startDate) : null}
                        onChange={(newDate) => handleStartDateChange(newDate ? newDate.format('YYYY-MM-DD') : null)}
                        renderInput={(params) => <TextField {...params} />}
                  />
                  <Box sx={{ mx: 2 }}> to </Box>
                  <DatePicker
                        label="End Date"
                        value={endDate ? dayjs(endDate) : null}
                        onChange={(newDate) => handleEndDateChange(newDate ? newDate.format('YYYY-MM-DD') : null)}
                        renderInput={(params) => <TextField {...params} />}
                  />
              </LocalizationProvider>
          </Box>
    );
}
