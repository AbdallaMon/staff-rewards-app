import {verifyToken} from "@/app/api/utlis/tokens";
import {checkIfEmailAlreadyConfirmed} from "@/app/api/services/employes";

export async function POST(request) {
    const {searchParams} = new URL(request.url);
    const token = searchParams.get("token")
    const confirmed = searchParams.get("confirmed")
    const withToken = searchParams.get("withToken")
    try {

        if (!token) {
            return Response.json({
                message: "You can only enter this page from the link sent to your email when u registered if your register is approved u dont need this page anymore",
                status: 400
            }, {status: 400})
        }


        const decoded = verifyToken(token)
        if (decoded) {
            const userId = decoded.userId;
            const res = await checkIfEmailAlreadyConfirmed(+userId, confirmed)
            if (withToken) {
                return Response.json({...res, ...decoded}, {status: res.status})

            }
            return Response.json(res, {status: res.status})
        }
        return Response.json({
            message: "You can only enter this page from the link sent to your email when u registered if your register is approved u dont need this page anymore",
            status: 400
        }, {status: 400})
    } catch (e) {
        return Response.json({
            message: "You can only enter this page from the link sent to your email when u registered if your register is approved u dont need this page anymore",
            status: 400
        }, {status: 400})
    }
}