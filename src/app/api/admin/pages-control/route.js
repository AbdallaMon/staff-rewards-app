import {getPageControl, updatePageControl} from "@/app/api/services/admin";

// GET request to fetch page control details
export async function GET() {
    const data = await getPageControl('REGISTER');
    return Response.json(data, {status: 200});
}

// POST request to update page control
export async function POST(request) {
    const body = await request.json();
    const data = await updatePageControl('REGISTER', body);
    return Response.json(data, {status: 200});
}
