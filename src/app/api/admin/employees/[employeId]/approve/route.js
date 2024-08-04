import {approveUser} from "@/app/api/services/admin";


export async function POST(request, response) {
    const {employeId} = response.params;
    const data = await approveUser(+employeId);
    return Response.json(data, {status: 200});
}


