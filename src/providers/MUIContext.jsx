"use client";

import {createTheme, ThemeProvider} from "@mui/material";
// #ffffff
// #f7f7f7
// #7c5e24
// #332d2d
// #384155

const theme = createTheme({
    palette: {
        primary: {
            main: "#7c5e24", // Your primary color
            contrastText: "#ffffff", // Text color for primary background
        },
        secondary: {
            main: "#332d2d", // Your secondary color
            contrastText: "#ffffff", // Text color for secondary background
        },
        tertiary: {
            main: "#384155", // Your tertiary color
            contrastText: "#ffffff", // Text color for tertiary background
        },
        background: {
            default: "#f7f7f7", // Background primary
            paper: "#ffffff", // Background secondary
        },
        text: {
            primary: "#332d2d", // Text color for headings
            secondary: "#384155", // Body text color
        },
    },
    typography: {
        fontFamily: ["Poppins", "sans-serif"].join(","),
    },
    breakpoints: {
        values: {
            xs: 0,
            sm: 600,
            md: 900,
            lg: 1200,
            xl: 1536,
            xxl: 1920, // Define the custom xxl breakpoint
        },
    },
    components: {
        MuiContainer: {
            defaultProps: {
                maxWidth: "xxl", // Set default maxWidth to xxl
            },
        },
    },
});

export default function MUIContextProvider({children}) {
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

