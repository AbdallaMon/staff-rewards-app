import {getBankDetailsData} from "@/app/api/services/finincal";

export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const centerId = searchParams.get('centerId');

    const res = await getBankDetailsData(date, centerId);
    return Response.json(res, {status: res.status});
}
