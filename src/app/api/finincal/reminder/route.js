import {NextResponse} from 'next/server';
import prisma from "@/lib/pirsma/prisma";
import {sendEmail} from "@/app/api/utlis/sendMail";
import {url} from "@/app/constants";
import dayjs from "dayjs";

export async function POST(request) {
    const {searchParams} = new URL(request.url);
    const userId = searchParams.get('userId');
    const centerId = searchParams.get('centerId');
    const date = searchParams.get('date');
    const {message} = await request.json();

    const filters = {
        attachment: null,
    };

    if (userId) {
        console.log(userId, "userId")
        filters.userId = parseInt(userId);
    } else {

        if (centerId) {
            filters.centerId = parseInt(centerId);
        }
    }
    if (date) {
        const parsedDate = new Date(date);
        const startOfDay = new Date(parsedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(parsedDate);
        endOfDay.setHours(23, 59, 59, 999);
        filters.date = {
            gte: startOfDay,
            lte: endOfDay
        };
    }
    try {
        // Fetch the relevant DayAttendance records
        const dayAttendances = await prisma.dayAttendance.findMany({
            where: filters,
            include: {
                user: {
                    select: {
                        email: true,
                        name: true,
                    },
                },
                center: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        if (!dayAttendances.length) {
            return NextResponse.json({message: 'No matching records found', status: 404}, {status: 404});
        }
        const dashboardLink = `${url}/dashboard/attendance`;

        for (const attendance of dayAttendances) {
            const formattedDate = dayjs(attendance.date).format('DD/MM/YYYY');

            const reminderMessage = `
                <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
                    <h2 style="color: #7c5e24;">Attendance Approval Reminder</h2>
                    <p>Dear ${attendance.user.name},</p>
                    <p>${message && message}</p>
                    <p>Please approve your attendance on ${formattedDate} at ${attendance.center.name}.</p>
                    <p>You can review and approve your attendance by clicking the button below:</p>
                    <a href="${dashboardLink}" style="display: inline-block; margin: 10px 0; padding: 10px 20px; background-color: #7c5e24; color: #ffffff; text-decoration: none; border-radius: 5px;">Go to Attendance Dashboard</a>
                </div>
            `;

            await sendEmail(
                  attendance.user.email,
                  'Attendance Approval Reminder',
                  reminderMessage
            );
        }


        return NextResponse.json({message: 'Reminders sent successfully', status: 200}, {status: 200});
    } catch (error) {
        console.error('Failed to send reminders:', error);
        return NextResponse.json({message: 'Failed to send reminders', status: 500}, {status: 500});
    }
}
