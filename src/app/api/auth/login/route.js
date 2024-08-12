import jwt from "jsonwebtoken";
import {cookies} from "next/headers";
import bcrypt from "bcrypt";
import prisma from "../../../../lib/pirsma/prisma";

const SECRET_KEY = process.env.SECRET_KEY;

export async function POST(request) {
    let body = await request.json();
    const cookieStore = cookies();

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: body.email,
            },
            select: {
                id: true,
                role: true,
                centerAdmin: true,
                password: true,
                emailConfirmed: true,
                accountStatus: true
            }
        });
        if (!user) {
            return Response.json({
                message: "No user found with this email", status: 500,

            });
        }
        if (user.accountStatus === "UNCOMPLETED" && user.role === "EMPLOYEE") {
            return Response.json({
                message: "Your registration is uncompleted or the admin request new change,Please review your email for registration complete info and link",
                auth: false, status: 500,

            });
        }
        if (user.accountStatus === "PENDING" && user.role === "EMPLOYEE") {
            return Response.json({
                message: "Your account still under review we will sent u an email once we finished thanks for your patience",
                auth: false, status: 500,

            });
        }
        if (user.accountStatus === "REJECTED" && user.role === "EMPLOYEE") {
            return Response.json({
                message: "Your account  is rejected we sent an email with the reason",
                auth: false, status: 500,

            });
        }
        if (!user.password) {
            return Response.json({
                message: "No password found in the database please click forget password and add a new password",
                auth: false, status: 500,

            });
        }
        const validPassword = await bcrypt.compare(body.password, user.password);

        if (!validPassword) {
            return Response.json({
                status: 500,
                message: "Incorrect password",
            });
        }
        if (!user.emailConfirmed) {
            return Response.json({
                status: 500,
                message: "Your email is not confirmed please follow the link we sent to u after register to confirm your email",
            });
        }
        const token = jwt.sign({
            userId: user.id,
            userRole: user.role,
            centerId: user.centerAdmin?.id,
            accountStatus: user.accountStatus
        }, SECRET_KEY, {
            expiresIn: '4h',
        });
        cookieStore.set({
            name: "token",
            value: token,
            httpOnly: true,
            secure: true,
            path: "/",
        });

        return Response.json({
            status: 200,
            message: "User signed in successfully redirecting...",
            user,
        });
    } catch (error) {
        return Response.json({
            status: 500,
            message: "Error signing in user " + error.message,
        });
    }
}
