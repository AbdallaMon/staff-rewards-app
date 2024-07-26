"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { usePathname, useRouter } from "next/navigation";

export default function HandleAuth({ children }) {
  const { isLoggedIn } = useSelector((state) => state.auth);
  const router = useRouter();
  useEffect(() => {
    if (isLoggedIn) router.push("/dashboard/");
  }, [isLoggedIn]);

  return (
    <>
      <div className={"flex bg-bgSecondary p-3  w-full h-full min-h-screen "}>

        {children}
      </div>
    </>
  );
}
