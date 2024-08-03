import {NextResponse} from 'next/server';
import {createAttendanceRecord, fetchAttendanceByCenterId} from "@/app/api/services/center";
import jwt from "jsonwebtoken";
import {getCookieValue} from "@/app/api/utlis/getCookieValue";

const SECRET_KEY = process.env.SECRET_KEY;

export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const page = searchParams.get("page");
    const limit = searchParams.get("limit");
    const filters = searchParams.get("filters");
    const parsedFilters = filters ? JSON.parse(filters) : {};
    const token = getCookieValue("token")
    if (!token) {
        return Response.json({
            status: 401,
            auth: false,
            message: "You are not signed in or your session expired"
        }, {status: 401});
    }
    const decoded = jwt.verify(token, SECRET_KEY);
    if (!decoded) {
        return NextResponse.json({status: 400, message: "Your session ended please login again"}, {status: 400});
    }
    const {centerId} = decoded;
    const data = await fetchAttendanceByCenterId(+centerId, +page, +limit, parsedFilters);
    return Response.json(data, {status: data.status});
}

export async function POST(request) {
    try {
        const body = await request.json();
        const {userId, shiftIds, duty, date, examType} = body;
        const token = getCookieValue("token")

        if (!token) {
            return Response.json({status: 401, auth: false, message: "Please sign in again"}, {status: 401});
        }
        const decoded = jwt.verify(token, SECRET_KEY);
        if (!decoded) {
            return NextResponse.json({status: 400, message: "Your session ended please relogin"}, {status: 400});
        }
        const {centerId} = decoded;


        const result = await createAttendanceRecord({
            userId,
            shiftIds,
            duty,
            date,
            centerId,
            examType
        });

        return Response.json(result, {status: result.status});
    } catch (error) {
        console.error("Error handling POST request:", error);
        return Response.json({status: 500, message: "Internal Server Error"}, {status: 500});
    }
}
