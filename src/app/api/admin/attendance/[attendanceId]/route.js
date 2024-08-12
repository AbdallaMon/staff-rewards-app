import {
    deleteAttendanceRecord,
    fetchAttendanceDetailsByDayAttendanceId,
    updateAttendanceRecords
} from "@/app/api/services/center";

export async function GET(request, response) {
    const {attendanceId} = response.params
    const data = await fetchAttendanceDetailsByDayAttendanceId(+attendanceId);
    return Response.json(data, {status: data.status});
}

export async function PUT(request, response) {
    const {attendanceId} = response.params
    const body = await request.json();
    const data = await updateAttendanceRecords(+attendanceId, body);
    return Response.json({
        message: "Attendance updated successfully",
        status: data.status,
        data
    }, {status: data.status});
}

export async function DELETE(request, response) {
    const {attendanceId} = response.params
    const res = await deleteAttendanceRecord(+attendanceId);
    return Response.json(res, {status: res.status});

}