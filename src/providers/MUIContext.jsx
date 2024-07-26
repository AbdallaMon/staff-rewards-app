"use client";

import { createTheme, ThemeProvider } from "@mui/material";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1AB69D", // Your primary color
      contrastText: "#ffffff", // Set the text color for primary background to white

    },
    secondary: {
      main: "#EE4A62", // Your secondary color
      contrastText: "#ffffff", // Set the text color for primary background to white

    },
  },
  typography: {
    fontFamily: ["Poppins", "sans-serif"].join(","),
  },
});
export default function MUIContextProvider({ children }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
