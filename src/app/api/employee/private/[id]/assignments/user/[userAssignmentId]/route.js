import {
    getUserAssignmentById,
} from "@/app/api/services/center";

export async function GET(request, response) {
    const {userAssignmentId} = response.params
    const data = await getUserAssignmentById(+userAssignmentId);
    return Response.json(data, {status: data.status});
}


