import {editAssignment, getAssignmentById} from "@/app/api/services/admin";

export async function GET(request, response) {
    const {id} = response.params
    const data = await getAssignmentById(+id);
    return Response.json(data, {status: data.status});
}

export async function PUT(request, response) {
    const {id} = response.params
    const body = await request.json();
    const data = await editAssignment(+id, body);
    return Response.json(data, {status: 200});
}

