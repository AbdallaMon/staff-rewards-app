import {getUserRatingReport} from "@/app/api/services/admin";


export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date");
    const centerId = searchParams.get("centerId");
    const examType = searchParams.get("examType");


    const res = await getUserRatingReport({date, centerId, examType});
    return Response.json(res, {status: res.status});
}

