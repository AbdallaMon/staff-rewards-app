import {
    deleteAdminAccount,
    editAdminAccount,
} from "@/app/api/services/admin";

export async function PUT(request, response) {
    const {userId} = response.params;
    const body = await request.json();
    const data = await editAdminAccount(+userId, body);
    return Response.json(data, {status: 200});
}

export async function DELETE(request, response) {
    const {userId} = response.params;
    const data = await deleteAdminAccount(+userId);
    return Response.json(data, {status: 200});
}