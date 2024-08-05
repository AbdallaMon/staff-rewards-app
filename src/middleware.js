// middleware.ts
import {NextResponse} from 'next/server';
import {cookies} from "next/headers";
import {jwtVerify} from 'jose';


export async function middleware(request) {
    const url = request.nextUrl.clone();
    const SECRET_KEY = new TextEncoder().encode(process.env.SECRET_KEY);
    const cookieStore = cookies();
    const token = cookieStore.get("token")?.value;
    try {
        if (!token) throw new Error('Token not found');

        const {payload} = await jwtVerify(token, SECRET_KEY);

        const {userRole} = payload;

        if (
              (url.pathname.startsWith('/api/admin') && userRole !== 'ADMIN') ||
              (url.pathname.startsWith('/api/center') && userRole !== 'CENTER') ||
              (url.pathname.startsWith('/api/employee/private') && userRole !== 'EMPLOYEE') ||
              (url.pathname.startsWith('/api/finincal') && userRole !== 'FINANCIAL_AUDITOR')
        ) {
            url.pathname = '/api/notauthorized';
            return NextResponse.redirect(url);
        }
    } catch (error) {
        console.error(error);
        url.pathname = '/api/notauthenticated';
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/api/admin/:path*',
        '/api/center/:path*',
        '/api/employee/private/:path*',
        '/api/finincal/:path*'
    ],
};
