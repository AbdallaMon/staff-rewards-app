import {getCookieValue} from "@/app/api/utlis/getCookieValue";
import {verifyToken} from "@/app/api/utlis/tokens";
import {
    createStudentAttendanceRecord,
    fetchStudentAttendancesByCenterId,
} from "@/app/api/services/center";
import jwt from "jsonwebtoken";
import {NextResponse} from "next/server";

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
    const data = await fetchStudentAttendancesByCenterId(+centerId, +page, +limit, parsedFilters);
    return Response.json(data, {status: data.status});
}

export async function POST(request) {
    const token = getCookieValue("token")
    let data = await request.json()
    if (!token) {
        return Response.json({status: 401, auth: false, message: "Please sign in again"}, {status: 401});
    }
    try {
        const decoded = verifyToken(token)
        if (decoded) {
            const {centerId} = decoded;
            data.centerId = +centerId;
            data.totalAttendedStudents = +data.totalAttendedStudents
            const res = await createStudentAttendanceRecord(data);
            return Response.json(res);
        } else {
            throw new Error("Invalid token");
        }
    } catch (error) {
        return new Response.json({
            auth: false,
            message: "Error authenticating user",
            error: error.message
        }, {status: 401});
    }
}