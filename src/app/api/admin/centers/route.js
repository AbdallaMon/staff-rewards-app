import {createCenter, createDuty, fetchCenters, fetchDuties} from "@/app/api/services/admin";

export async function GET(request){
    const searchParams =request.nextUrl.searchParams;
    const page = searchParams.get("page") || 1;
    const limit=searchParams.get("limit") || 10;
    const data=await fetchCenters(+page,+limit);
    return Response.json(data,{status:200});
}
export async function POST(request){
    const body=await request.json();
    const data=await createCenter(body);
    return Response.json(data,{status:200});
}