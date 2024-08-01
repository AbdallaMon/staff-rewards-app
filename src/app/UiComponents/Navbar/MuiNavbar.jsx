"use client";
import {AppBar, Toolbar, Box, Typography, IconButton, Menu, MenuItem, Container, Button} from "@mui/material";
import {useSelector} from "react-redux";
import Link from "next/link";
import {useState} from "react";
import {FaUserCircle} from "react-icons/fa";
import LogoutButton from "@/app/UiComponents/Buttons/LogoutBtn";

export default function Navbar() {
    const {isLoggedIn, data} = useSelector((state) => state.auth);
    const [anchorEl, setAnchorEl] = useState(null);
    const [open, setOpen] = useState(false);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
        setOpen(!open);
    };
    const handleClose = () => {
        setAnchorEl(null);
        setOpen(false);
    };

    return (
          <Box sx={{flexGrow: 1}}>
              <AppBar position="absolute" sx={{zIndex: 10}}>
                  <Container maxWidth="xl">
                      <Toolbar>

                          {isLoggedIn ? (
                                data.role === "EMPLOYEE" ? (
                                      <>
                                          <Box display="flex" alignItems="center" gap={2} sx={{flexGrow: 1}}>
                                              <Link href="/dashboard" passHref>
                                                  <Button color="inherit">Dashboard</Button>
                                              </Link>
                                              <Link href="/dashboard/attendance" passHref>
                                                  <Button color="inherit">Attendance</Button>
                                              </Link>
                                              <Link href="/dashboard/calendar" passHref>
                                                  <Button color="inherit">Calendar</Button>
                                              </Link>
                                          </Box>
                                          <Box sx={{flexGrow: 1, display: "flex", justifyContent: "flex-end"}}>

                                              <LogoutButton fit={true}/>
                                          </Box>
                                      </>
                                ) : (

                                      <div className={"flex justify-between w-full"}>
                                          <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                                              {/*My App*/}
                                          </Typography>
                                          <IconButton
                                                size="large"
                                                aria-label="account of current user"
                                                aria-controls="menu-appbar"
                                                aria-haspopup="true"
                                                onClick={(event) => handleMenu(event)}
                                                color="inherit"
                                          >
                                              <FaUserCircle/>
                                          </IconButton>
                                          {anchorEl && open && (
                                                <Menu
                                                      id="menu-appbar"
                                                      anchorEl={anchorEl}
                                                      anchorOrigin={{
                                                          vertical: 'top',
                                                          horizontal: 'right',
                                                      }}
                                                      keepMounted
                                                      transformOrigin={{
                                                          vertical: 'top',
                                                          horizontal: 'right',
                                                      }}
                                                      open={Boolean(anchorEl)}
                                                      onClose={handleClose}
                                                >
                                                    <MenuItem>
                                                        <Link href="/dashboard"
                                                              className={"mr-4 flex gap-1 items-center"}>
                                                            <FaUserCircle/> Dashboard
                                                        </Link>
                                                    </MenuItem>
                                                    <MenuItem>
                                                        <LogoutButton/>
                                                    </MenuItem>
                                                </Menu>
                                          )}
                                      </div>
                                )
                          ) : (
                                <Button variant="contained" color="tertiary">
                                    <Link href="/login" className={"flex"}>
                                        Login
                                    </Link>
                                </Button>
                          )}
                      </Toolbar>
                  </Container>
              </AppBar>
          </Box>
    );
}
