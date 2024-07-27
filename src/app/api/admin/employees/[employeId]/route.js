import {EditEmploy, getUserById} from "@/app/api/services/admin";



export async function GET(request,response){
const {employeId}=response.params;

    if (!employeId) {
        return Response.json({ message: "User ID is required" }, { status: 400 });
    }

    try {
        const result = await getUserById(+employeId);
        return Response.json(result, { status: result.status });
    } catch (error) {
        return Response.json({ message: "Failed to fetch user data" }, { status: 500 });
    }
}

export async function PUT(request,response){
    const {employeId}=response.params;
    const body=await request.json();
    const data=await EditEmploy(+employeId,body);
    return Response.json(data,{status:200});
}


