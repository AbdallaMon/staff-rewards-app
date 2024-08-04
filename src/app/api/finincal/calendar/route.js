import {fetchCalendars} from "@/app/api/services/admin";

export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page") || 1;
    const limit = searchParams.get("limit") || 10;
    const filters = searchParams.get("filters") || {};
    const parsedFilters = JSON.parse(filters);
    const data = await fetchCalendars(+page, +limit, parsedFilters);
    return Response.json(data, {status: 200});
}

