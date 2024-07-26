"use client";

import { useSelector } from "react-redux";

export default function HandleAuth({ children }) {
  let { role } = useSelector((state) => state.auth);
  if (!role) return null;

  return (
    <>
      <div className={"min-h-screen bg-white py-20"}>
          <div className={""}>{children}</div>
      </div>
    </>
  );
}
