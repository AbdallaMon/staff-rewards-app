import {
    assignAssignmentToADuty,
    createNewAssignment,
    getAssignmentDuties,
    getAssignments, removeDutyFromAnAssigment
} from "@/app/api/services/admin";


export async function GET(request, response) {
    const {id} = response.params
    const res = await getAssignmentDuties(+id);
    return Response.json(res, {status: res.status});
}

export async function POST(request, response) {
    const body = await request.json();
    const {id} = response.params
    const data = await assignAssignmentToADuty(+id, +body.id);
    return Response.json(data, {status: 200});
}

export async function DELETE(request, response) {
    const body = await request.json();
    const {id} = response.params

    const data = await removeDutyFromAnAssigment(+id, +body.dutyId);
    return Response.json(data, {status: 200});
}

