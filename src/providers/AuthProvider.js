"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import handleAuthState from "../helpers/functions/handleAuthState";
import {url} from "@/app/constants";

export const AuthContext = createContext(null);
export default function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { isLoggedIn } = useSelector((state) => state.auth);
  const [redirect, setRedirect] = useState(false);
  useEffect(() => {
    async function fetchData() {
      const response = await fetch(`${url}/api/auth/state`);
      const data = await response.json();

      await handleAuthState(
        dispatch,
        data.auth,
        data.role,
        data.user,
        data.emailConfirmed,
      );
    }

    fetchData();
  }, [redirect, isLoggedIn]);
  return (
    <AuthContext.Provider value={{ setRedirect, redirect }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};
