import {getEmployeeById, updateEmployee} from "@/app/api/services/employes";
import parseFormData from "@/app/api/utlis/parseFormData";
import deleteFileFromPath from "@/app/api/utlis/deleteAFile";
import {cookies} from "next/headers";
import {jwtVerify} from "jose";

const SECRET_KEY = new TextEncoder().encode(process.env.SECRET_KEY);

export async function GET(request, response) {
    const id = response.params.id
    const data = await getEmployeeById(id)
    return Response.json(data, {status: data.status});
}

export async function POST(request, response) {
    const id = response.params.id
    const data = await request.json()
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const {payload: decoded} = await jwtVerify(token, SECRET_KEY);

    const res = await updateEmployee(+id, data, decoded, cookieStore, SECRET_KEY)
    return Response.json(res, {status: res.status});

}

export async function PUT(request, response) {
    const id = response.params.id
    const {uploadedUrls, deletedUrl} = await parseFormData(request, true)

    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    const {payload: decoded} = await jwtVerify(token, SECRET_KEY);

    const res = await updateEmployee(+id, uploadedUrls, decoded, cookieStore, SECRET_KEY)

    await deleteFileFromPath(deletedUrl)
    return Response.json(res, {status: res.status});

}