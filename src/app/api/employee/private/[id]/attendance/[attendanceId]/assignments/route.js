import {
    getAssignmentsByDayAttendance,
} from "@/app/api/services/center";

export async function GET(request, response) {
    const {attendanceId} = response.params
    const searchParams = request.nextUrl.searchParams;
    const isArchived = searchParams.get("isArchive")
    const data = await getAssignmentsByDayAttendance(+attendanceId, isArchived);
    return Response.json(data, {status: data.status});
}

