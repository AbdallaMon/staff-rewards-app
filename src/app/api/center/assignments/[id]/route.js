import {
    deleteUserAssignment, editUserAssignment,
    getUserAssignmentById,
} from "@/app/api/services/center";

export async function GET(request, response) {
    const {id} = response.params
    const data = await getUserAssignmentById(+id);
    return Response.json(data, {status: data.status});
}

export async function PUT(request, response) {
    const {id} = response.params
    const body = await request.json();
    const res = await editUserAssignment(+id, body);
    return Response.json(
          res
          , {status: res.status});
}

export async function DELETE(request, response) {
    const {id} = response.params
    const res = await deleteUserAssignment(+id);
    return Response.json(res, {status: res.status});

}