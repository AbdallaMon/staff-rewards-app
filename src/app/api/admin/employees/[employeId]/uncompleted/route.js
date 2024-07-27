import { uncompletedUser} from "@/app/api/services/admin";




export async function POST(request,response){
    const {employeId}=response.params;
    const body=await request.json();
    const data = await uncompletedUser(+employeId, body);
    return Response.json(data,{status:200});
}


