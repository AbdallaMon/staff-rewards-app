import {verifyToken} from "@/app/api/utlis/tokens";
import parseFormData from "@/app/api/utlis/parseFormData";
import {completeRegisterAndConfirmUser, createEmployeeRequest} from "@/app/api/services/employes";

export async function POST(request) {
    const {searchParams} = new URL(request.url);
    const token = searchParams.get("token")
    if (!token) {
        return Response.json({
            message: "You can only enter this page from the link sent to your email when u registered if your register is approved u dont need this page anymore",
            status: 400
        }, {status: 400})
    }
    const decoded = verifyToken(token)
    if (decoded) {
        const uploadedUrls = await parseFormData(request)
        const userId = decoded.userId;
        const res = await completeRegisterAndConfirmUser(uploadedUrls, userId)
        return Response.json(res, {status: res.status})
    } else {
        return Response.json({
            message: "You can only enter this page from the link sent to your email when u registered if your register is approved u dont need this page anymore",
            status: 400
        }, {status: 400})
    }
}