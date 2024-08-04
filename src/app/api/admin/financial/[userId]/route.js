import {deleteFinancialAccount, editFinancialAccount} from "@/app/api/services/admin";

export async function PUT(request, response) {
    const {userId} = response.params;
    const body = await request.json();
    const data = await editFinancialAccount(+userId, body);
    return Response.json(data, {status: 200});
}

export async function DELETE(request, response) {
    const {userId} = response.params;
    const data = await deleteFinancialAccount(+userId);
    return Response.json(data, {status: 200});
}