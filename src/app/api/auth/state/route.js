import {cookies} from "next/headers";
import jwt from "jsonwebtoken";

export async function GET() {
    const SECRET_KEY = process.env.SECRET_KEY;
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
        return Response.json({auth: false, message: "No token provided"});
    }
    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        if (decoded) {
            const {userId, userRole} = decoded;
            const user = {
                id: userId,
                role: userRole,
                centerId: decoded.centerId,
                emailConfirmed: decoded.emailConfirmed
            }

            return Response.json({
                message: "User authenticated and confirmed",
                user,
                auth: true,
                role: user.role,
                emailConfirmed: user.emailConfirmed,
            });
        } else {
            throw new Error("Invalid token");
        }
    } catch (error) {
        console.log(error);
        return Response.json({
            message: "Your session has finished",
            error: error.message,
            auth: false,
            status: 400
        }, {status: 400});
    }
}
