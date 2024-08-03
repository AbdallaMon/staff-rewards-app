import {fetchAttendanceByCenterId} from "@/app/api/services/center";
import {fetchAttendanceForFinincial} from "@/app/api/services/finincal";


export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const filters = searchParams.get("filters");
    const parsedFilters = filters ? JSON.parse(filters) : {};

    const res = await fetchAttendanceForFinincial(+page, +limit, parsedFilters);
    return Response.json(res, {status: res.status});
}

