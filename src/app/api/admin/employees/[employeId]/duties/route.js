import {addUserDuties, removeUserDuty} from "@/app/api/services/admin";

export async function POST(request, response) {
    const {duties} = await request.json();

    const userId = response.params.employeId
    const data = await addUserDuties(+userId, duties);
    return Response.json(data, {status: data.status});
}

export async function DELETE(request, response) {

    const {dutyId} = await request.json();
    const userId = response.params.employeId

    const data = await removeUserDuty(+userId, +dutyId);
    return Response.json(data, {status: data.status});

}