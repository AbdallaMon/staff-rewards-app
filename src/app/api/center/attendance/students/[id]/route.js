import {
    updateStudentsAttendanceRecords
} from "@/app/api/services/center";


export async function PUT(request, response) {
    const {id} = response.params
    const body = await request.json();
    const res = await updateStudentsAttendanceRecords(+id, body);
    return Response.json(
          res
          , {status: res.status});
}

