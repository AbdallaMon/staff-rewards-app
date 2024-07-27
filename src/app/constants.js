import process from "next/dist/build/webpack/loaders/resolve-url-loader/lib/postcss";

export const paginationOptions = [20, 30, 40, 50];
export const initialPageLimit = 20;

export const       colors={
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
      }

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
      export  const    emiratesOptions = [
    { id: "ABU_DHABI", value: "Abu Dhabi" },
    { id: "DUBAI", value: "Dubai" },
    { id: "SHARJAH", value: "Sharjah" },
    { id: "AJMAN", value: "Ajman" },
    { id: "UMM_AL_QUWAIN", value: "Umm Al Quwain" },
    { id: "RAK", value: "Ras Al Khaimah" },
    { id: "FUJAIRAH", value: "Fujairah" }
]
export const url=process.env.NEXT_PUBLIC_URL;