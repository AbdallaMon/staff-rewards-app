import process from "next/dist/build/webpack/loaders/resolve-url-loader/lib/postcss";

export const paginationOptions = [20, 30, 40, 50];
export const initialPageLimit = 20;

export const colors = {
    primary: "#7c5e24",
    primaryAlt: "#a38630", // Slightly lighter variant of primary
    primaryGradient: "linear-gradient(-90deg, #a38630 0%, #7c5e24 100%)",
    secondary: "#332d2d",
    secondaryText: "#4a3b3b", // Slightly lighter variant of secondary
    tertiary: "#384155",
    body: "#384155",
    bgPrimary: "#f7f7f7",
    bgSecondary: "#ffffff",
    bgTeritary: "#e0e0e0", // Light grey as an additional background color
    heading: "#332d2d",
};

export const simpleModalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    maxHeight: "90%",
    overflow: "auto",
    width: {
        xs: "95%",
        sm: "80%",
        md: "60%",
    },
    maxWidth: {
        md: "600px",
    },
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
}
export const emiratesOptions = [
    {id: "ABU_DHABI", value: "Abu Dhabi"},
    {id: "DUBAI", value: "Dubai"},
    {id: "SHARJAH", value: "Sharjah"},
    {id: "AJMAN", value: "Ajman"},
    {id: "UMM_AL_QUWAIN", value: "Umm Al Quwain"},
    {id: "RAS_AL_KHAIMAH", value: "Ras Al Khaimah"},
    {id: "FUJAIRAH", value: "Fujairah"},
    {id: "AIN", value: "Al ain"}
]

export const url = process.env.NEXT_PUBLIC_URL;