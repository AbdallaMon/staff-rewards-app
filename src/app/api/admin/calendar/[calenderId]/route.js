import {deleteCalendar, editCalendar} from "@/app/api/services/admin";

export async function PUT(request, response) {
    const {calenderId} = response.params;
    const body = await request.json();
    const data = await editCalendar(+calenderId, body);
    return Response.json(data, {status: 200});
}

export async function DELETE(request, response) {
    const {calenderId} = response.params;
    const data = await deleteCalendar(+calenderId);
    return Response.json(data, {status: 200});
}