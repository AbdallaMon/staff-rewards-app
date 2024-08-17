"use client";
import {AppBar, Toolbar, Box, Typography, IconButton, Menu, MenuItem, Container, Button} from "@mui/material";
import {useSelector} from "react-redux";
import Link from "next/link";
import {useState} from "react";
import {FaUserCircle, FaBars} from "react-icons/fa";
import LogoutButton from "@/app/UiComponents/Buttons/LogoutBtn";
import useMediaQuery from '@mui/material/useMediaQuery';

export default function Navbar() {
    const {isLoggedIn, data} = useSelector((state) => state.auth);
    const [anchorEl, setAnchorEl] = useState(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [open, setOpen] = useState(false);
    const isMobile = useMediaQuery('(max-width:600px)');

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
        setOpen(!open);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setOpen(false);
    };

    const handleLinksMenu = (event) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleLinksMenuClose = () => {
        setMenuAnchorEl(null);
    };

    return (
          <Box sx={{flexGrow: 1}}>
              <AppBar position="absolute" sx={{zIndex: 10, backgroundColor: "background.default"}}>
                  <Container maxWidth="xl">
                      <Toolbar>
                          {isLoggedIn ? (
                                data.role === "EMPLOYEE" ? (
                                      <>
                                          {isMobile ? (
                                                <Box display="flex" alignItems="center" sx={{flexGrow: 1}}>
                                                    <IconButton
                                                          size="large"
                                                          aria-label="menu"
                                                          aria-controls="links-menu-appbar"
                                                          aria-haspopup="true"
                                                          onClick={handleLinksMenu}
                                                          color="primary"
                                                    >
                                                        <FaBars/>
                                                    </IconButton>
                                                    <Menu
                                                          id="links-menu-appbar"
                                                          anchorEl={menuAnchorEl}
                                                          anchorOrigin={{
                                                              vertical: 'top',
                                                              horizontal: 'left',
                                                          }}
                                                          keepMounted
                                                          transformOrigin={{
                                                              vertical: 'top',
                                                              horizontal: 'left',
                                                          }}
                                                          open={Boolean(menuAnchorEl)}
                                                          onClose={handleLinksMenuClose}
                                                    >
                                                        <MenuItem onClick={handleLinksMenuClose}>
                                                            <Link href="/dashboard">
                                                                <Button color="primary">Dashboard</Button>
                                                            </Link>
                                                        </MenuItem>
                                                        <MenuItem onClick={handleLinksMenuClose}>
                                                            <Link href="/dashboard/attendance">
                                                                <Button color="primary">Attendance</Button>
                                                            </Link>
                                                        </MenuItem>
                                                        <MenuItem onClick={handleLinksMenuClose}>
                                                            <Link href="/dashboard/calendar">
                                                                <Button color="primary">Calendar</Button>
                                                            </Link>
                                                        </MenuItem>
                                                        <MenuItem onClick={handleLinksMenuClose}>
                                                            <Link href="/dashboard/profile">
                                                                <Button color="primary">Profile</Button>
                                                            </Link>
                                                        </MenuItem>
                                                    </Menu>
                                                    <Box sx={{
                                                        flexGrow: 1,
                                                        display: "flex",
                                                        justifyContent: "flex-end"
                                                    }}>
                                                        <LogoutButton fit={true}/>
                                                    </Box>
                                                </Box>
                                          ) : (
                                                <Box display="flex" alignItems="center" gap={2} sx={{flexGrow: 1}}>
                                                    <Link href="/dashboard">
                                                        <Button color="primary">Dashboard</Button>
                                                    </Link>
                                                    <Link href="/dashboard/attendance">
                                                        <Button color="primary">Attendance</Button>
                                                    </Link>
                                                    <Link href="/dashboard/calendar">
                                                        <Button color="primary">Calendar</Button>
                                                    </Link>
                                                    <Link href="/dashboard/profile">
                                                        <Button color="primary">Profile</Button>
                                                    </Link>
                                                    <Box sx={{
                                                        flexGrow: 1,
                                                        display: "flex",
                                                        justifyContent: "flex-end"
                                                    }}>
                                                        <LogoutButton fit={true}/>
                                                    </Box>
                                                </Box>
                                          )}
                                      </>
                                ) : (
                                      <div className={"flex justify-between w-full"}>
                                          <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                                          </Typography>
                                          <IconButton
                                                size="large"
                                                aria-label="account of current user"
                                                aria-controls="menu-appbar"
                                                aria-haspopup="true"
                                                onClick={(event) => handleMenu(event)}
                                                color="primary"
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
                                                      onClose={handleMenuClose}
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
                                <div className={"flex justify-between w-full"}>
                                    <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
                                    </Typography>
                                    <Button variant="contained" color="tertiary">
                                        <Link href="/login" className={"flex"}>
                                            Login
                                        </Link>
                                    </Button>
                                </div>
                          )}
                      </Toolbar>
                  </Container>
              </AppBar>
          </Box>
    );
}
