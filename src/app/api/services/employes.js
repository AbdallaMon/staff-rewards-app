import prisma from "@/lib/pirsma/prisma";
import {url} from "@/app/constants";
import {sendEmail} from "@/app/api/utlis/sendMail";
import {createToken} from "@/app/api/utlis/tokens";
import {Prisma} from "@prisma/client";
import {handlePrismaError} from "@/app/api/utlis/prismaError";

export async function createEmployeeRequest(data) {
    try {
        data.dutyId = +data.dutyId;
        data.centerId = +data.centerId;
        data.emailConfirmed = false;
        data.accountStatus = "UNCOMPLETED"
        data.role = "EMPLOYEE"
        const user = await prisma.user.create(
              {
                  data
              }
        )
        const payloadData = {
            userId: user.id,
            email: user.email,
        }
        const payload = createToken(payloadData)
        const emailContent = `
            <h1>Confirm your account</h1>
            <p>Your account has been created. To complete your registration, please confirm your email address by clicking the link below:</p>
            <p><a href="${url}/confirm?token=${payload}">Confirm your email</a></p>
            <p>If the above link doesn't work, copy and paste the following URL into your browser:</p>
            <p>${url}/uncompleted?token=${payload}</p>
        `;
        await sendEmail(user.email, 'Confirm your account', emailContent);

        return {status: 200, message: 'A confirmation link sent to your account please confirm it'};
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {

            if (e.code === 'P2002' && e.meta && e.meta.target.includes('User_email_key')) {
                return {message: "A user with this email already exists.", status: 400}
            }
        }
        return handlePrismaError(e)
    }
}