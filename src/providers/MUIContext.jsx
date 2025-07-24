"use client";
import { createTheme, ThemeProvider } from "@mui/material";

// Enhanced color palette based on your original colors
const colors = {
  // Primary colors (enhanced from your #7c5e24)
  primary: "#8B6914",
  primaryLight: "#A67C2A",
  primaryDark: "#6B5507",
  primaryAlt: "rgba(139, 105, 20, 0.08)",
  primaryGradient: "linear-gradient(135deg, #8B6914 0%, #A67C2A 100%)",
  textOnPrimary: "#ffffff",

  // Secondary colors (enhanced from your #332d2d)
  secondary: "#2D2828",
  secondaryLight: "#423D3D",
  secondaryDark: "#1F1A1A",
  textOnSecondary: "#ffffff",

  // Tertiary colors (enhanced from your #384155)
  tertiary: "#3A4458",
  tertiaryLight: "#4A5468",
  tertiaryDark: "#2A3445",

  // Background colors (enhanced from your #f7f7f7)
  body: "#FAFAFA",
  bgPrimary: "#FFFFFF",
  bgSecondary: "#F8F9FA",
  bgTertiary: "#F1F3F4",
  paperBg: "#FFFFFF",
  surfaceElevated: "#FFFFFF",

  // Text colors (enhanced from your original)
  heading: "#2D2828",
  textPrimary: "#2D2828",
  textSecondary: "#3A4458",
  textTertiary: "#6B7280",
  textMuted: "#9CA3AF",

  // Semantic colors
  error: "#DC2626",
  errorLight: "#EF4444",
  errorDark: "#B91C1C",
  warning: "#D97706",
  warningLight: "#F59E0B",
  warningDark: "#B45309",
  success: "#059669",
  successLight: "#10B981",
  successDark: "#047857",
  info: "#0284C7",
  infoLight: "#0EA5E9",
  infoDark: "#0C4A6E",

  // UI elements
  border: "#E5E7EB",
  borderDark: "#D1D5DB",
  shadow: "rgba(45, 40, 40, 0.08)",
  shadowDark: "rgba(45, 40, 40, 0.15)",
  highlight: "rgba(139, 105, 20, 0.12)",
};

const generateMuiShadows = (baseShadowColor, darkShadowColor) => {
  const shadows = ["none"]; // Elevation 0 is always 'none'

  // Manually define first few subtle shadows, similar to MUI's defaults
  shadows.push(`0px 1px 2px ${baseShadowColor}`); // Elevation 1
  shadows.push(
    `0px 1px 3px ${baseShadowColor}, 0px 2px 5px ${baseShadowColor}`
  ); // Elevation 2
  shadows.push(
    `0px 2px 4px ${baseShadowColor}, 0px 4px 8px ${baseShadowColor}`
  ); // Elevation 3
  shadows.push(
    `0px 3px 5px ${baseShadowColor}, 0px 6px 10px ${baseShadowColor}`
  ); // Elevation 4

  // Generate remaining shadows with increasing intensity
  for (let i = 5; i <= 24; i++) {
    const yOffset = Math.floor(i * 0.8);
    const blur = Math.floor(i * 1.6);
    const spread = Math.floor(i * 0.1);
    const opacity = 0.04 + i * 0.012;

    // Parse hex color to RGB
    const hex = darkShadowColor.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    const currentShadowColor = `rgba(${r}, ${g}, ${b}, ${opacity.toFixed(3)})`;

    shadows.push(
      `0px ${yOffset}px ${blur}px ${spread}px ${currentShadowColor}`
    );
  }
  return shadows;
};

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      light: colors.primaryLight,
      dark: colors.primaryDark,
      contrastText: colors.textOnPrimary,
    },
    secondary: {
      main: colors.secondary,
      light: colors.secondaryLight,
      dark: colors.secondaryDark,
      contrastText: colors.textOnSecondary,
    },
    tertiary: {
      main: colors.tertiary,
      light: colors.tertiaryLight,
      dark: colors.tertiaryDark,
      contrastText: "#ffffff",
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
      disabled: colors.textMuted,
    },
    background: {
      default: colors.body,
      paper: colors.paperBg,
    },
    common: {
      white: "#ffffff",
      black: colors.heading,
    },
    action: {
      hover: colors.primaryAlt,
      selected: colors.highlight,
      disabled: colors.textMuted,
      disabledBackground: colors.bgTertiary,
      focus: "rgba(139, 105, 20, 0.12)",
    },
    error: {
      main: colors.error,
      light: colors.errorLight,
      dark: colors.errorDark,
      contrastText: "#ffffff",
    },
    warning: {
      main: colors.warning,
      light: colors.warningLight,
      dark: colors.warningDark,
      contrastText: "#ffffff",
    },
    info: {
      main: colors.info,
      light: colors.infoLight,
      dark: colors.infoDark,
      contrastText: "#ffffff",
    },
    success: {
      main: colors.success,
      light: colors.successLight,
      dark: colors.successDark,
      contrastText: "#ffffff",
    },
    divider: colors.border,
    // Custom colors
    gradient: {
      primary: colors.primaryGradient,
    },
  },
  zIndex: {
    modal: 1300,
    snackbar: 1500,
    tooltip: 1600,
    appBar: 1100,
    drawer: 1200,
  },
  typography: {
    fontFamily: ["Poppins", "system-ui", "sans-serif"].join(","),
    h1: {
      color: colors.heading,
      fontWeight: 800,
      fontSize: "clamp(2rem, 5vw, 3rem)",
      lineHeight: 1.1,
      letterSpacing: "-0.02em",
    },
    h2: {
      color: colors.heading,
      fontWeight: 700,
      fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
      lineHeight: 1.2,
      letterSpacing: "-0.01em",
    },
    h3: {
      color: colors.heading,
      fontWeight: 600,
      fontSize: "clamp(1.5rem, 3vw, 2rem)",
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h4: {
      color: colors.heading,
      fontWeight: 600,
      fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)",
      lineHeight: 1.4,
    },
    h5: {
      color: colors.textPrimary,
      fontWeight: 500,
      fontSize: "1.25rem",
      lineHeight: 1.4,
    },
    h6: {
      color: colors.textPrimary,
      fontWeight: 500,
      fontSize: "1.125rem",
      lineHeight: 1.4,
    },
    subtitle1: {
      color: colors.textSecondary,
      fontSize: "1.125rem",
      fontWeight: 400,
      lineHeight: 1.5,
    },
    subtitle2: {
      color: colors.textSecondary,
      fontSize: "1rem",
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      color: colors.textPrimary,
      fontSize: "1rem",
      lineHeight: 1.6,
      fontWeight: 400,
    },
    body2: {
      color: colors.textSecondary,
      fontSize: "0.875rem",
      lineHeight: 1.5,
      fontWeight: 400,
    },
    caption: {
      color: colors.textTertiary,
      fontSize: "0.75rem",
      lineHeight: 1.4,
      fontWeight: 400,
    },
    overline: {
      color: colors.textMuted,
      fontSize: "0.75rem",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.08em",
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      textTransform: "none",
      letterSpacing: "0.02em",
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
      xxl: 1920,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: generateMuiShadows(colors.shadow, colors.shadowDark),
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
      easeOut: "cubic-bezier(0.0, 0, 0.2, 1)",
      easeIn: "cubic-bezier(0.4, 0, 1, 1)",
      sharp: "cubic-bezier(0.4, 0, 0.6, 1)",
    },
  },
  components: {
    MuiContainer: {
      defaultProps: {
        maxWidth: "xxl",
      },
      styleOverrides: {
        root: {
          paddingLeft: "1rem",
          paddingRight: "1rem",
          "@media (min-width: 600px)": {
            paddingLeft: "1.5rem",
            paddingRight: "1.5rem",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: colors.paperBg,
          backgroundImage: "none",
          transition: "box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        elevation0: {
          backgroundColor: colors.bgPrimary,
        },
        elevation1: {
          backgroundColor: colors.surfaceElevated,
          boxShadow: `0 1px 3px ${colors.shadow}`,
        },
        elevation2: {
          backgroundColor: colors.surfaceElevated,
          boxShadow: `0 4px 6px ${colors.shadow}`,
        },
        elevation3: {
          backgroundColor: colors.surfaceElevated,
          boxShadow: `0 10px 15px ${colors.shadow}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: colors.paperBg,
          borderRadius: 16,
          boxShadow: `0 1px 3px ${colors.shadow}`,
          border: `1px solid ${colors.border}`,
          overflow: "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: `0 8px 25px ${colors.shadowDark}`,
            transform: "translateY(-2px)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.875rem",
          padding: "10px 20px",
          minHeight: 44,
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:focus-visible": {
            outline: `2px solid ${colors.primary}`,
            outlineOffset: 2,
          },
        },
        contained: {
          boxShadow: `0 2px 8px ${colors.shadow}`,
          "&:hover": {
            boxShadow: `0 6px 20px ${colors.shadowDark}`,
            transform: "translateY(-1px)",
          },
          "&:active": {
            transform: "translateY(0px)",
          },
        },
        outlined: {
          borderColor: colors.border,
          borderWidth: 1.5,
          "&:hover": {
            borderColor: colors.primary,
            backgroundColor: colors.primaryAlt,
            borderWidth: 1.5,
          },
        },
        text: {
          "&:hover": {
            backgroundColor: colors.primaryAlt,
          },
        },
        sizeLarge: {
          padding: "12px 28px",
          fontSize: "1rem",
          minHeight: 48,
        },
        sizeSmall: {
          padding: "6px 16px",
          fontSize: "0.8125rem",
          minHeight: 36,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            backgroundColor: colors.bgSecondary,
            borderRadius: 10,
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            "& fieldset": {
              borderColor: colors.border,
              borderWidth: 1.5,
            },
            "&:hover fieldset": {
              borderColor: colors.borderDark,
            },
            "&.Mui-focused fieldset": {
              borderColor: colors.primary,
              borderWidth: 2,
            },
            "&.Mui-focused": {
              backgroundColor: colors.bgPrimary,
            },
          },
          "& .MuiInputLabel-root": {
            color: colors.textSecondary,
            "&.Mui-focused": {
              color: colors.primary,
            },
          },
        },
      },
    },
    MuiSvgIcon: {
      styleOverrides: {
        root: {
          color: colors.textSecondary,
          transition: "color 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: `${colors.paperBg}F2`,
          color: colors.textPrimary,
          boxShadow: `0 1px 3px ${colors.shadow}`,
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${colors.border}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.bgPrimary,
          borderRight: `1px solid ${colors.border}`,
          backgroundImage: "none",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: colors.border,
          opacity: 1,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: colors.bgTertiary,
          color: colors.textPrimary,
          borderRadius: 8,
          fontWeight: 500,
          fontSize: "0.8125rem",
          height: 32,
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        colorPrimary: {
          backgroundColor: colors.primaryAlt,
          color: colors.primary,
          "&:hover": {
            backgroundColor: colors.highlight,
          },
        },
        outlined: {
          borderColor: colors.border,
          "&:hover": {
            backgroundColor: colors.bgSecondary,
          },
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.875rem",
          minHeight: 48,
          "&.Mui-selected": {
            color: colors.primary,
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: colors.primary,
          height: 3,
          borderRadius: "3px 3px 0 0",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: `0 25px 50px ${colors.shadowDark}`,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.secondary,
          fontSize: "0.75rem",
          borderRadius: 6,
          padding: "8px 12px",
        },
        arrow: {
          color: colors.secondary,
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            backgroundColor: colors.primaryAlt,
          },
        },
      },
    },
  },
});

export default function MUIContextProvider({ children }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}
