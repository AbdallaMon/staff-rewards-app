"use client";
import * as React from "react";
import PropTypes from "prop-types";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {TabScrollButton} from "@mui/material";

function CustomTabPanel(props) {
    const {children, value, index, ...other} = props;

    return (
          <div
                role="tabpanel"
                hidden={value !== index}
                id={`simple-tabpanel-${index}`}
                aria-labelledby={`simple-tab-${index}`}
                {...other}
          >
              {value === index && (
                    <Box sx={{p: 3}}>
                        <Typography>{children}</Typography>
                    </Box>
              )}
          </div>
    );
}

CustomTabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
}

const adminLinks = [
    {label: "Centers", href: "/dashboard"},
    {label: "Configure", href: "/dashboard/configure"},

    {label: "Staff", href: "/dashboard/staff"},
    {label: "Staff requests", href: "/dashboard/staff-requests"},
];

const reportLinks = [
    {label: "Attendances", href: "/dashboard"},
    {label: "Edit attendance", href: "/dashboard/attendances/edit"},
    {label: "Attendances reports", href: "/dashboard/reports/attendances"},
    {label: "Attendances approval reports", href: "/dashboard/reports/approval"},
    {label: "Bank details Approval", href: "/dashboard/reports/bank"},
];

const staffLinks = [
    {label: "Staff", href: "/dashboard"},
    {label: "Attendance", href: "/dashboard/attendance"},
    {label: "Calendar", href: "/dashboard/calendar"},
];

export function BasicTabs({section}) {
    const currentPath = usePathname();
    const tabs = section === "admin" ? adminLinks : section === "report" ? reportLinks : staffLinks;

    const currentIndex = tabs.findIndex((tab) => tab.href === currentPath);
    const [value, setValue] = React.useState(
          currentIndex !== -1 ? currentIndex : 0
    );

    React.useEffect(() => {
        if (currentIndex !== -1) {
            setValue(currentIndex);
        }
    }, [currentIndex]);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const getScrollButtonDirection = (direction) => {
        return direction === "left" ? "left" : "right";
    };

    return (
          <Box sx={{width: "100%"}}>
              <Box sx={{borderBottom: 1, borderColor: "divider"}}>
                  <Tabs
                        value={value}
                        onChange={handleChange}
                        aria-label="basic tabs"
                        variant="scrollable"
                        scrollButtons
                        allowScrollButtonsMobile
                        sx={{
                            "& .MuiTabs-flexContainer": {
                                justifyContent: "flex-start",
                            },
                        }}
                        ScrollButtonComponent={(props) => (
                              <TabScrollButton
                                    {...props}
                                    direction={getScrollButtonDirection(props.direction)}
                              />
                        )}
                  >
                      {tabs.map((tab, index) => (
                            <Link key={tab.href} href={tab.href}>
                                <Tab
                                      label={tab.label}
                                      {...a11yProps(index)}
                                      component="a"
                                />
                            </Link>
                      ))}
                  </Tabs>
              </Box>
          </Box>
    );
}
