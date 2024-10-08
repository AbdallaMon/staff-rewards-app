"use client"
import ProfilePage from "@/app/UiComponents/DataViewer/EmployeeProfile";
import {useSelector} from "react-redux";

export default function Page() {
    let user = useSelector((state) => state.auth);

    return <ProfilePage userId={user.data.id}/>
}
