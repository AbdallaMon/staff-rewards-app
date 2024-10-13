import {getPageControl} from "@/app/api/services/admin";

export async function POST() {
    const data = await getPageControl('REGISTER');
    console.log(data, "data")
    return Response.json({...data, date: new Date()}, {status: 200});
}

