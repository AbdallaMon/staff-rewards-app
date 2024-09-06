import {requestNewSignature} from "@/app/api/services/admin";

export async function PUT(request, response) {
    const {employeId} = response.params;
    const res = await requestNewSignature(+employeId);
    return Response.json(res, {status: res.status});
}


