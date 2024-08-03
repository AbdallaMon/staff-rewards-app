import {fetchAttendanceDetailsByDayAttendanceId, updateAttendanceRecords} from "@/app/api/services/center";
import {updateAttendanceRecordsWithLog} from "@/app/api/services/finincal";

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