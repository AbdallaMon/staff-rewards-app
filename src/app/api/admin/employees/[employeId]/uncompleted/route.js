import { uncompletedUser} from "@/app/api/services/admin";
import {getBaseUrl} from "@/app/api/utlis/utility";


export async function POST(request,response){
    const {employeId}=response.params;
    const body=await request.json();
    const data = await uncompletedUser(+employeId, body,getBaseUrl(request));
    return Response.json(data,{status:200});
}


