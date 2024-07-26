
/** @type {import('tailwindcss').Config} */
const tailwind= {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#1AB69D",
        primaryAlt: "#31B978",
        primaryGradient: "linear-gradient(-90deg, #31B978 0%, #1AB69D 100%)",
        secondary: "#EE4A62",
        secondaryText: "#ff5b5c",
        tertiary: "#f8b81f",
        body: "#808080",
        bgPrimary: "#EAF0F2",
        bgSecondary: "#f0f4f5",
        bgTeritary: "#e9f8f5",
        heading: "#181818",
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