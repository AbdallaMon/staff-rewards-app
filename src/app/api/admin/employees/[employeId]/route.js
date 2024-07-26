import {EditEmploy, editShift} from "@/app/api/services/admin";

export async function PUT(request,response){
    const {employeId}=response.params;
    const body=await request.json();
    const data=await EditEmploy(+employeId,body);
    return Response.json(data,{status:200});
}
