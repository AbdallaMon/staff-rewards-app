import {getEmployeeAttendance} from "@/app/api/services/employes";

export async function GET(request, response) {
    const id = response.params.id;
    const searchParams = request.nextUrl.searchParams
    const filters = searchParams.get("filters") || {};
    const parsedFilters = JSON.parse(filters);
    const res = await getEmployeeAttendance(id, parsedFilters)
    return Response.json(res, {status: res.status})
}