import {getPageControl} from "@/app/api/services/admin";

export async function POST() {
    const data = await getPageControl('REGISTER');
    return Response.json({...data}, {status: 200});
}

