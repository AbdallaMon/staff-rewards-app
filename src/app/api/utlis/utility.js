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
    const emailContent = `
        <h3>${approve ? "Your account has been approved you can create new password for this email " : "You are receiving this because your admin created a new user account for you with this email:"} ${email}</h3>
                
        <p><a href="${resetLink}">Click here to enter your new password</a></p>
        
        <p><strong style="color:red">Please note that this link will not be usable after 1 day.</strong></p>
        
        <p>If you need to generate a new password, you can do so at any time by visiting <a href="${url}/reset">this link</a>.</p>
    `;

    await sendEmail(
          email,
          "Your Account Details",
          emailContent
    );
}
