"use client";

import {createTheme, ThemeProvider} from "@mui/material";

const theme = createTheme({
    palette: {
        primary: {
            main: "#1AB69D", // Your primary color
            contrastText: "#ffffff", // Text color for primary background
        },
        secondary: {
            main: "#EE4A62", // Your secondary color
            contrastText: "#ffffff", // Text color for secondary background
        },
        tertiary: {
            main: "#f8b81f", // Your tertiary color
            contrastText: "#000000", // Text color for tertiary background
        },
        background: {
            default: "#EAF0F2", // Background primary
            paper: "#f0f4f5", // Background secondary
        },
        text: {
            primary: "#181818", // Text color for headings
            secondary: "#808080", // Body text color
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

