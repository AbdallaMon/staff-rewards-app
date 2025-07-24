import {fetchEmployees} from "@/app/api/services/admin";

export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || 1;
    const limit = searchParams.get("limit") || 10;
    const filters = searchParams.get("filters") || {};
    const parsedFilters = JSON.parse(filters);
    const centerId = parsedFilters.centerId;
    const dutyId = parsedFilters.dutyId;
    const userId = parsedFilters.userId
    const data = await fetchEmployees(+page, +limit, false, false, centerId && +centerId, false, dutyId && +dutyId, userId && +userId);
    return Response.json(data, {status: 200});
}
