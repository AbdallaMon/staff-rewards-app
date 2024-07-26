"use client"
import { AppBar, Toolbar, Box, Typography, IconButton, Menu, MenuItem } from "@mui/material";
import { useSelector } from "react-redux";
import Link from "next/link";
import { useState } from "react";
import { FaHome, FaSignOutAlt, FaUserCircle, FaBars } from "react-icons/fa";
import LogoutButton from "@/app/UiComponents/Buttons/LogoutBtn";

export default function Navbar() {
    const { isLoggedIn } = useSelector((state) => state.auth);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        // Implement logout functionality here
        handleClose();
    };

    return (
          <Box sx={{ flexGrow: 1 }}>
              <AppBar position="static">
                  <Toolbar>

                      <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                          <Link href="/" className={"flex gap-1 items-center"} >
                                  <FaHome /> Home
                          </Link>
                      </Typography>
                      {isLoggedIn ? (
                            <div>

                                <IconButton
                                      size="large"
                                      aria-label="account of current user"
                                      aria-controls="menu-appbar"
                                      aria-haspopup="true"
                                      onClick={handleMenu}
                                      color="inherit"
                                >
                                    <FaUserCircle />
                                </IconButton>
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

                                    <Link href="/dashboard" className={"mr-4 flex gap-1 items-center"}>
                                        <FaUserCircle /> Dashboard
                                    </Link>
                                    </MenuItem>
                                    <MenuItem>

                                    <LogoutButton />
                                    </MenuItem>
                                </Menu>
                            </div>
                      ) : (
                            <Link href="/login" >
                                    Login
                            </Link>
                      )}
                  </Toolbar>
              </AppBar>
          </Box>
    );
}
