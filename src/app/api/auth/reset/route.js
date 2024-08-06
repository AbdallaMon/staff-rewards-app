import crypto from "crypto";
import prisma from "../../../../lib/pirsma/prisma";
import {sendEmail} from "../../utlis/sendMail";
import {url} from "@/app/constants";

export async function POST(request) {
    let body = await request.json();

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: body.email,
            },
        });
        if (!user) {
            return Response.json({
                status: 500,
                message: "No user found with this email",
            });
        }

        const token = crypto.randomBytes(20).toString("hex");
        await prisma.user.update({
            where: {
                email: body.email,
            },
            data: {
                resetPasswordToken: token,
                resetPasswordExpires: new Date(Date.now() + 3600000),
            },
        });

        const resetLink = `${url}/reset?token=${token}`;
        const emailSubject = "Password Reset Request";
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
                <h2 style="color: #7c5e24;">Password Reset Request</h2>
                <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
                <p>Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:</p>
                <a href="${resetLink}" style="display: inline-block; margin: 10px 0; padding: 10px 20px; background-color: #7c5e24; color: #ffffff; text-decoration: none; border-radius: 5px;">Reset Password</a>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
                <p style="color: #888;">This link will expire in 1 hour.</p>
            </div>
        `;

        await sendEmail(body.email, emailSubject, emailHtml);

        return Response.json({
            status: 200,
            message: "Password reset link sent to " + body.email,
        });
    } catch (error) {
        console.log(error);
        return Response.json({
            status: 500,
            message: "Error sending password reset link ",
        });
    }
}
