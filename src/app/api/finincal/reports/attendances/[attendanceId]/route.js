import {getUserDayAttendanceWithUserSignatureReturned} from "@/app/api/services/finincal";
import {updateDayAttendanceAttachment} from "@/app/api/services/employes";
import parseFormData from "@/app/api/utlis/parseFormData";

export async function GET(_, response) {
    const {attendanceId} = response.params
    const data = await getUserDayAttendanceWithUserSignatureReturned(+attendanceId);
    return Response.json(data, {status: data.status});
}

export async function POST(request, response) {
    const attendanceId = response.params.attendanceId
    const uploadedUrls = await parseFormData(request)
    const res = await updateDayAttendanceAttachment(attendanceId, uploadedUrls)

    return Response.json(res, {status: res.status})
}