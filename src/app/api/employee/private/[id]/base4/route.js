import {Buffer} from "buffer";

export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    let signature = searchParams.get("signature")


    if (signature) {
        const signatureResponse = await fetch(signature);
        if (signatureResponse.ok) {
            const buffer = await signatureResponse.arrayBuffer();
            const base64Signature = Buffer.from(buffer).toString('base64');
            signature = `data:image/png;base64,${base64Signature}`;
        } else {
            signature = null;
        }
    }
    return Response.json({signature}, {status: 200})
}