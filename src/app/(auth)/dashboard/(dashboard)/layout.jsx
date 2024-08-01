"use client";
import HandleAuth from "./HandleAuth";
import {useRouter} from "next/navigation";
import {useEffect, useState} from "react";
import {toast} from "react-toastify";
import {
    Failed,
    Success,
} from "@/app/UiComponents/ToastUpdate/ToastUpdate";

export default function Layout({center, admin, staff}) {
    const [res, setRes] = useState(null);

    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            const toastId = toast.loading("Checking your authentication...");
            const response = await fetch(`/api/auth/state`, {cache: "no-store"});
            const result = await response.json();
            if (result.auth === false) {
                router.push("/login");
                toast.update(toastId, Failed("Not Authenticated. Redirecting..."));
            }
            if (result.auth === true) {
                toast.update(
                      toastId,
                      Success("Authenticated. Loading data please wait..."),
                );
            }
            setRes(result);
        }

        fetchData();
    }, []);
    if (!res || !res.role) return null;
    const role = res?.role;

    return (
          <HandleAuth>
              {role === "ADMIN" ? admin : role === "EMPLOYEE" ? staff : role === "CENTER" ? center : null}{" "}
          </HandleAuth>
    );
}
