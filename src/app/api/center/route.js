import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import {fetchUsersByCenterId} from "@/app/api/services/center";

export async function GET(request) {
    const SECRET_KEY = process.env.SECRET_KEY;
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
        return  Response.json({status:401,auth: false, message: "Please sign in again" }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        if (decoded) {
            const { centerId } = decoded;
            const { searchParams } = new URL(request.url);
            const filters = JSON.parse(searchParams.get("filters") || "{}");
            const page = parseInt(searchParams.get("page") || "1", 10);
            const limit = parseInt(searchParams.get("limit") || "10", 10);

            const data=await fetchUsersByCenterId(+centerId,+page,+limit,filters)
            return Response.json(data);
        } else {
            throw new Error("Invalid token");
        }
    } catch (error) {
        return new Response(JSON.stringify({ auth: false, message: "Error authenticating user", error: error.message }), { status: 401 });
    }
}
