import {
    getUserAssignmentById,
} from "@/app/api/services/center";

export async function GET(request, response) {
    const {id} = response.params
    const data = await getUserAssignmentById(+id);
    return Response.json(data, {status: data.status});
}


