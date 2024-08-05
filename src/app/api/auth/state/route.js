import {cookies} from "next/headers";
import {jwtVerify} from "jose";

export async function GET() {
    const SECRET_KEY = new TextEncoder().encode(process.env.SECRET_KEY);
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
        return Response.json({auth: false, message: "You are not signed in"});
    }
    try {
        const {payload: decoded} = await jwtVerify(token, SECRET_KEY);
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
                status: 200
            }, {status: 200});
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
