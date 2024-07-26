import {deleteDuty, editDuty} from "@/app/api/services/admin";

export async function PUT(request,response){
    const {dutyId}=response.params;
    const body=await request.json();
    const data=await editDuty(+dutyId,body);
    return Response.json(data,{status:200});
}
export async function DELETE(request,response){
    const {dutyId}=response.params;
    const data=await deleteDuty(+dutyId);
    return Response.json(data,{status:200});
}