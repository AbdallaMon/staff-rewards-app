import {getUserBankApproval} from "@/app/api/services/finincal";

export async function GET(request) {
    const searchParams = request.nextUrl.searchParams
    const page = searchParams.get("page") || 1;
    const limit = searchParams.get("limit") || 10;
    const filters = searchParams.get("filters") || {};
    const parsedFilters = JSON.parse(filters);

    const res = await getUserBankApproval(page, limit, parsedFilters)
    return Response.json(res, {status: res.status})
}