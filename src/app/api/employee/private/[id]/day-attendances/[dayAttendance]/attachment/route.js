import {updateDayAttendanceAttachment} from "@/app/api/services/employes";
import parseFormData from "@/app/api/utlis/parseFormData";

export async function POST(request, response) {
    const dayAttendance = response.params.dayAttendance
    const uploadedUrls = await parseFormData(request)
    const res = await updateDayAttendanceAttachment(dayAttendance, uploadedUrls)

    return Response.json(res, {status: res.status})
}