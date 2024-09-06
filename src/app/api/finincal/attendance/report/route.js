import {getAttendanceData} from "@/app/api/services/finincal";

export async function GET(request) {
    const searchParams = request.nextUrl.searchParams
    const date = searchParams.get('date');
    const centerId = searchParams.get('centerId');
    const examType = searchParams.get("examType")
    const res = await getAttendanceData(date, centerId, examType);
    return Response.json(res, {status: res.status})

}