import {getUnpaidDayAttendanceDates, markDayAttendancesAsPaid} from "@/app/api/services/finincal";

export async function GET(request, response) {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const centerId = searchParams.get("centerId")

    try {
        const res = await getUnpaidDayAttendanceDates(new Date(startDate), new Date(endDate), centerId);
        return Response.json(res, {status: res.status})

    } catch (error) {
        console.error(error);
        return Response.json({message: "Something wrong happened", status: 400}, {status: 400})
    }
}

export async function POST(request, response) {
    const data = await request.json()
    const searchParams = request.nextUrl.searchParams

    const centerId = searchParams.get("centerId")

    try {
        const res = await markDayAttendancesAsPaid(data, centerId)
        return Response.json(res, {status: res.status})

    } catch (error) {
        console.error(error);
        return Response.json({message: "Something wrong happened", status: 400}, {status: 400})
    }
}