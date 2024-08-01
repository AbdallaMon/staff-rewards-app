import {getEmployeeById, updateEmployee} from "@/app/api/services/employes";
import parseFormData from "@/app/api/utlis/parseFormData";
import {deleteFileFromUrl} from "@/app/api/utlis/deleteAFile";

export async function GET(request, response) {
    const id = response.params.id
    const data = await getEmployeeById(id)
    return Response.json(data, {status: data.status});
}

export async function POST(request, response) {
    const id = response.params.id
    const data = await request.json()

    const res = await updateEmployee(+id, data)
    return Response.json(res, {status: res.status});

}

export async function PUT(request, response) {
    const id = response.params.id
    const {uploadedUrls, deletedUrl} = await parseFormData(request, true)

    const res = await updateEmployee(+id, uploadedUrls)

    await deleteFileFromUrl(deletedUrl)
    return Response.json(res, {status: res.status});

}