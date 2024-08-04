/** @type {import('tailwindcss').Config} */
const tailwind = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
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
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                      "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};

export default tailwind;