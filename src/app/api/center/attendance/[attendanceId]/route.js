import {fetchAttendanceDetailsByDayAttendanceId, updateAttendanceRecords} from "@/app/api/services/center";

export async function GET(request,response){
    const {attendanceId}=response.params
    const data = await fetchAttendanceDetailsByDayAttendanceId(+attendanceId);
    return Response.json(data, { status: data.status });
}
export async function PUT(request,response){
    const {attendanceId}=response.params
    const body = await request.json();
    // dayAttendanceId, editedAttendances, deletedAttendances, userId, amount, date, centerId, examType
    const data=await updateAttendanceRecords(+attendanceId,body);
return Response.json({ message: "Attendance updated successfully",status:200 ,data}, { status: 200 });
}