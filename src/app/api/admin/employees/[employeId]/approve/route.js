import {approveUser} from "@/app/api/services/admin";




export async function POST(request,response){
    const {employeId}=response.params;
    const body=await request.json();
    const data = await approveUser(+employeId, body);
    return Response.json(data,{status:200});
}


