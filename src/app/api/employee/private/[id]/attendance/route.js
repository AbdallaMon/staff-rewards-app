import {getEmployeeAttendance} from "@/app/api/services/employes";

export async function GET(request, response) {
    const id = response.params.id;
    const searchParams = request.nextUrl.searchParams;
    const filters = searchParams.get("filters") || "{}"; // Default to empty object
    const parsedFilters = JSON.parse(filters);

    const page = parseInt(searchParams.get("page") || 1);
    const limit = parseInt(searchParams.get("limit") || 20);

    const res = await getEmployeeAttendance(id, parsedFilters, page, limit);
    return Response.json(res, {status: res.status});
}
