// app/api/proxy/route.js
import {NextResponse} from 'next/server';
import {Buffer} from "buffer";

export async function GET(req) {
    const {searchParams} = new URL(req.url);
    const url = searchParams.get('url');

    try {
        const response = await fetch(url);
        const buffer = await response.arrayBuffer();
        const contentType = response.headers.get('content-type');

        return new NextResponse(Buffer.from(buffer), {
            headers: {
                'Content-Type': contentType,
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (err) {
        return new NextResponse('Failed to load the resource', {status: 500});
    }
}
