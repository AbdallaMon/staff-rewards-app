import {updateEmployeeRating} from "@/app/api/services/center";

export async function PUT(request,response){
    const {employId}=response.params;
    const body=await request.json();
    const data=await updateEmployeeRating(+employId,body.rating);
    return Response.json(data,{status:200});
}
