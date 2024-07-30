import {createEmployeeRequest} from "@/app/api/services/employes";

export async function POST(request) {
    const data = await request.json()
    const res = await createEmployeeRequest(data)
    return Response.json(res, {status: res.status})
}