import {
    createUserAssignment,
    getAssignmentsByDayAttendance,
} from "@/app/api/services/center";

export async function GET(request, response) {
    const {attendanceId} = response.params
    const searchParams = request.nextUrl.searchParams;
    const isArchived = searchParams.get("isArchive")
    const data = await getAssignmentsByDayAttendance(+attendanceId, isArchived);
    return Response.json(data, {status: data.status});
}

export async function POST(request, response) {
    const {attendanceId} = response.params
    const body = await request.json();
    const res = await createUserAssignment(+attendanceId, body);
    return Response.json(
          res
          , {status: res.status});
}

