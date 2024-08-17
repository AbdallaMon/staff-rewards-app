import {updateEmployeeRating} from "@/app/api/services/center";
import {getUserById} from "@/app/api/services/admin";

export async function PUT(request, response) {
    const {employId} = response.params;
    const body = await request.json();
    const data = await updateEmployeeRating(+employId, body.rating);
    return Response.json(data, {status: 200});
}

export async function GET(request, response) {
    const {employId} = response.params;

    if (!employId) {
        return Response.json({message: "User ID is required"}, {status: 400});
    }

    try {
        const result = await getUserById(+employId);
        return Response.json(result, {status: result.status});
    } catch (error) {
        return Response.json({message: "Failed to fetch user data"}, {status: 500});
    }
}