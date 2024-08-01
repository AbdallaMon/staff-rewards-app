"use client"
import {useSelector} from "react-redux";
import AttendanceHistory from "@/app/UiComponents/DataViewer/AttendanceHistory";
import CheckAttendanceAttachments from "@/app/UiComponents/Feedback/CheckAttendanceAttachments";

export default function Page() {
    let user = useSelector((state) => state.auth);

    return <CheckAttendanceAttachments>
        <AttendanceHistory userId={user.data.id}/>
    </CheckAttendanceAttachments>
}
