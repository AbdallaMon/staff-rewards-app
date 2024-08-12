import {
    deleteAttendanceRecordWithLog,
    fetchAttendanceDetailsByDayAttendanceId,
} from "@/app/api/services/center";
import {updateAttendanceRecordsWithLog} from "@/app/api/services/finincal";
import {getCookieValue} from "@/app/api/utlis/getCookieValue";
import {verifyToken} from "@/app/api/utlis/tokens";

export async function GET(request, response) {
    const {attendanceId} = response.params
    const data = await fetchAttendanceDetailsByDayAttendanceId(+attendanceId);
    return Response.json(data, {status: data.status});
}

export async function PUT(request, response) {
    const {attendanceId} = response.params
    const body = await request.json();
    const searchParams = request.nextUrl.searchParams
    const userId = searchParams.get("userId")
    const data = await updateAttendanceRecordsWithLog(+attendanceId, body, +userId);
    return Response.json({message: "Attendance updated successfully", status: 200, data}, {status: 200});
}

export async function DELETE(request, response) {
    const {attendanceId} = response.params
    const token = getCookieValue("token")

    if (!token) {
        return Response.json({status: 401, auth: false, message: "Please sign in again"}, {status: 401});
    }
    try {
        const decoded = verifyToken(token)
        if (!decoded) {
            return Response.json({message: "please relogin", status: 400}, {status: 400})
        }
        const {userId} = decoded;
        const res = await deleteAttendanceRecordWithLog(+attendanceId, +userId);
        return Response.json(res, {status: res.status});
    } catch (e) {
        console.log(e, "e")
        return Response.json({message: "please relogin", status: 400}, {status: 400})
    }

}