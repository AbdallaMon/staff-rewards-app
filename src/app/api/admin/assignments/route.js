import {createNewAssignment, getAssignments} from "@/app/api/services/admin";


export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const filters = searchParams.get("filters");
    const parsedFilters = filters ? JSON.parse(filters) : {};

    const res = await getAssignments(+page, +limit, parsedFilters);
    return Response.json(res, {status: res.status});
}

export async function POST(request) {
    const body = await request.json();
    const data = await createNewAssignment(body);
    return Response.json(data, {status: 200});
}