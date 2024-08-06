import crypto from "crypto";
import {sendEmail} from "@/app/api/utlis/sendMail";
import prisma from "@/lib/pirsma/prisma";
import {url} from "@/app/constants";

export const getBaseUrl = (request) => {
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || (request.connection && request.connection.encrypted ? 'https' : 'http');
    return `${protocol}://${host}`;
};

export async function generateResetToken(email, approve = false) {
    const token = crypto.randomBytes(20).toString("hex");
    await prisma.user.update({
        where: {
            email: email,
        },
        data: {
            resetPasswordToken: token,
            resetPasswordExpires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day expiration
        },
    });

    const resetLink = `${url}/reset?token=${token}`;
    const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
            <h2 style="color: #7c5e24;">${approve ? "Account Approved" : "Account Created"}</h2>
            <p>${approve ? "Your account has been approved. You can create a new password for this email:" : "An admin created a new user account for you with this email:"} <strong>${email}</strong></p>
            <p>Please click on the following link, or paste this into your browser to complete the process:</p>
            <a href="${resetLink}" style="display: inline-block; margin: 10px 0; padding: 10px 20px; background-color: #7c5e24; color: #ffffff; text-decoration: none; border-radius: 5px;">Create New Password</a>
            <p><strong style="color: red;">Please note that this link will expire in 1 day.</strong></p>
            <p>If you need to generate a new password, you can do so at any time by visiting <a href="${url}/reset" style="color: #7c5e24;">this link</a>.</p>
        </div>
    `;

    await sendEmail(
          email,
          "Your Account Details",
          emailHtml
    );
}
