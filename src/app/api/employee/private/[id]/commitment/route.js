import {getEmployeeCommitmentDataById} from "@/app/api/services/employes";

export async function GET(request, response) {
    const id = response.params.id
    const data = await getEmployeeCommitmentDataById(id)
    return Response.json(data, {status: data.status});
}