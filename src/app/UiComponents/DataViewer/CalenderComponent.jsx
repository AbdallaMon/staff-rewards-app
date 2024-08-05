"use client";
import React, {useState} from 'react';
import Calendar from 'react-calendar';
import {Box, Button, TableCell, Typography, useTheme} from '@mui/material';
import 'react-calendar/dist/Calendar.css';
import {colors} from "@/app/constants";

const CalendarComponent = ({
                               data,
                               labelKey,
                               setFilters,
                               withEdit,
                               withDelete,
                               withArchive,
                               onEdit,
                               onDelete,
                               onArchive,
                               class_Name = "",
                               editButtonText,
                               extraComponentProps,
                               extraComponent: ExtraComponent,
                               setData
                           }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const handleMonthChange = ({activeStartDate}) => {
        setCurrentDate(activeStartDate);
        setFilters((prevFilters) => ({
            ...prevFilters,
            month: activeStartDate.getMonth() + 1,
            year: activeStartDate.getFullYear()
        }));
    };

    const theme = useTheme();
    const renderDay = ({date, view}) => {
        if (view !== 'month') return null;
        const dayData = data?.filter(item => new Date(item.date).toDateString() === date.toDateString());
        const hasData = dayData && dayData.length > 0;

        return (
              <Box
                    sx={{
                        padding: '8px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        height: '100%',
                        position: 'relative',
                        overflowY: 'auto',
                        background: hasData ? colors.primaryGradient : 'inherit',
                        color: hasData ? theme.palette.secondary.contrastText : 'inherit',
                    }}
              >
                  {dayData?.map(item => (
                        <Box key={item.id} sx={{marginTop: '4px'}}>
                            <Typography variant="body2"
                                        sx={{
                                            color: theme.palette.primary.contrastText,
                                            background: theme.palette.secondary.main
                                            , py: 1,
                                            borderRadius: 2
                                        }}>
                                {item[labelKey]} Exam
                            </Typography>
                            <Box sx={{display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '4px'}}>
                                {withEdit && <Button size="small" variant="contained"
                                                     onClick={() => onEdit(item)}>{editButtonText}</Button>}
                                {withDelete && <Button size="small" variant="contained" color="secondary"
                                                       onClick={() => onDelete(item)}>Delete</Button>}
                                {withArchive && <Button size="small" variant="contained" color="warning"
                                                        onClick={() => onArchive(item)}>Archive</Button>}
                                {ExtraComponent && (
                                      <>
                                          <ExtraComponent
                                                item={item}
                                                setData={setData}
                                                {...extraComponentProps}
                                          />
                                      </>
                                )}
                            </Box>
                        </Box>
                  ))}
              </Box>
        );
    };

    return (
          <Box sx={{width: '100%', maxWidth: '100%', overflowX: 'auto'}} className={class_Name}>
              <Calendar
                    onActiveStartDateChange={handleMonthChange}
                    value={currentDate}
                    tileContent={renderDay}
                    view="month"
                    prev2Label={null}
                    next2Label={null}
              />
          </Box>
    );
};

export default CalendarComponent;
