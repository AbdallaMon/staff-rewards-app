import {getUserDayAttendancesWithoutAttachment} from "@/app/api/services/employes";

export async function GET(request, {params}) {
    const {id} = params;
    const res = await getUserDayAttendancesWithoutAttachment(id);
    return Response.json(res, {status: res.status})
}