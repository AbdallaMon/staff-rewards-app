import {NextResponse} from 'next/server';

import {url} from "@/app/constants";
import dayjs from "dayjs";
import {sendEmail} from "@/app/api/utlis/sendMail";
import prisma from "@/lib/pirsma/prisma";

export async function POST(request) {
    const data = await request.json();
    const {userId, dayAttendanceId, userEmail, userName, centerName, date, message} = data
    if (!userId || !dayAttendanceId || !userEmail || !userName || !centerName || !date) {
        return NextResponse.json({message: 'Missing required fields', status: 400}, {status: 400});
    }

    try {
        // Nullify the attachment for the given dayAttendance
        await prisma.dayAttendance.update({
            where: {id: +dayAttendanceId},
            data: {attachment: null},
        });

        const dashboardLink = `${url}/dashboard/attendance/edit?dayAttendanceId=${dayAttendanceId}`;
        const reminderMessage = `
            <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
                <h2 style="color: #7c5e24;">Attendance Approval problem</h2>
                <p>Dear ${userName},</p>
                <p>Your attendance record for ${dayjs(date).format('DD/MM/YYYY')} at ${centerName} has some problems. Please re-upload the correct file.</p>
                ${message ? `<p>${message}</p>` : ''}
                <p>You can go to the attendance page by clicking the button below:</p>
                <a href="${dashboardLink}" style="display: inline-block; margin: 10px 0; padding: 10px 20px; background-color: #7c5e24; color: #ffffff; text-decoration: none; border-radius: 5px;">Edit Attendance</a>
            </div>
        `;
        console.log(userEmail, "userEmail")
        await sendEmail(
              userEmail,
              'Attendance Approval problem',
              reminderMessage
        );

        return NextResponse.json({
            message: 'Attachment removed and reminder sent successfully',
            status: 200
        }, {status: 200});
    } catch (error) {
        console.error('Failed to remove attachment and send reminder:', error);
        return NextResponse.json({
            message: 'Failed to remove attachment and send reminder',
            status: 500
        }, {status: 500});
    }
}
