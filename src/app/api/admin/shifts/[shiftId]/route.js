import { archiveShift, deleteShift, editShift} from "@/app/api/services/admin";

export async function PUT(request,response){
    const {shiftId}=response.params;
    const body=await request.json();
    const data=await editShift(+shiftId,body);
    return Response.json(data,{status:200});
}
export async function DELETE(request,response){
    const {shiftId}=response.params;
    const data=await deleteShift(+shiftId);
    return Response.json(data,{status:200});
}
export async function PATCH(request,response){
    const {shiftId}=response.params;
    const data=await archiveShift(+shiftId);
    return Response.json(data,{status:200});
}