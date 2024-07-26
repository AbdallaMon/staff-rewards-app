import {deleteCenter, deleteDuty, editCenter, editDuty} from "@/app/api/services/admin";

export async function PUT(request,response){
    const {centerId}=response.params;
    const body=await request.json();
    const data=await editCenter(+centerId,body);
    return Response.json(data,{status:200});
}
export async function DELETE(request,response){
    const {centerId}=response.params;
    const data=await deleteCenter(+centerId);
    return Response.json(data,{status:200});
}