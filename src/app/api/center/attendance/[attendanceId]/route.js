import {fetchAttendanceDetailsByDayAttendanceId} from "@/app/api/services/center";

export async function GET(request,response){
    const {attendanceId}=response.params
    const data = await fetchAttendanceDetailsByDayAttendanceId(+attendanceId);
    return Response.json(data, { status: data.status });
}