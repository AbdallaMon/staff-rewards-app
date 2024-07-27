import { NextResponse } from 'next/server';
import {createAttendanceRecord} from "@/app/api/services/center";
import {cookies} from "next/headers";
import jwt from "jsonwebtoken";

export async function POST(request) {
    try {
        const body = await request.json();
        const { userId, shiftIds, duty, date } = body;
        const SECRET_KEY = process.env.SECRET_KEY;
        const cookieStore = cookies();
        const token = cookieStore.get("token")?.value;
        if (!token) {
            return  Response.json({status:401,auth: false, message: "Please sign in again" }, { status: 401 });
        }
        const decoded = jwt.verify(token, SECRET_KEY);
        if (!decoded) {
            return NextResponse.json({ status: 400, message: "Your session ended please relogin" }, { status: 400 });
        }
        const { centerId } = decoded;


        const result = await createAttendanceRecord({
            userId,
            shiftIds,
            duty,
            date,
            centerId,
        });

        return Response.json(result, { status: result.status });
    } catch (error) {
        console.error("Error handling POST request:", error);
        return Response.json({ status: 500, message: "Internal Server Error" }, { status: 500 });
    }
}
