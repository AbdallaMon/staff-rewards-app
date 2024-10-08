import "./globals.css";

import {League_Spartan} from "next/font/google";
import AuthProvider from "@/providers/AuthProvider";
import ToastProvider from "@/providers/ToastLoadingProvider";
import ReduxProvider from "@/providers/ReduxProvider";
import MUIContextProvider from "@/providers/MUIContext";
import Navbar from "@/app/UiComponents/Navbar/MuiNavbar";
import DotsLoader from "@/app/UiComponents/Feedback/DotsLoading";

const inter = League_Spartan({subsets: ["latin"]});


export default function RootLayout({children}) {
    return (
          <html lang="en">
          <body className={inter.className}>
          <MUIContextProvider>
              <ReduxProvider>
                  <ToastProvider>
                      <AuthProvider>
                          <Navbar/>
                          <DotsLoader/>
                          {children}
                      </AuthProvider>
                  </ToastProvider>
              </ReduxProvider>
          </MUIContextProvider>
          </body>
          </html>
    );
}
