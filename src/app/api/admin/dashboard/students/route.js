import prisma from "@/lib/pirsma/prisma";

export async function GET(request, response) {
    const searchParams = request.nextUrl.searchParams;
    const centerId = searchParams.get('centerId') ? parseInt(searchParams.get('centerId')) : null;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')) : null;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')) : null;
    const date = searchParams.get('date') ? new Date(searchParams.get('date')) : null;

    // Filter setup
    const where = {};
    if (centerId) {
        where.centerId = centerId;
    }

    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        where.date = {
            gte: startOfDay,
            lte: endOfDay
        };
    } else if (startDate && endDate) {
        where.date = {
            gte: startDate,
            lte: endDate
        };
    }

    try {
        // Fetch total students' attendance for each exam type
        const studentAttendances = await prisma.studentAttendance.findMany({
            where,
            select: {
                examType: true,
                totalAttendedStudents: true,
            },
        });

        const totalIncome = studentAttendances.reduce((sum, attendance) => sum + (attendance.totalAttendedStudents * 35), 0);

        const dayAttendances = await prisma.dayAttendance.findMany({
            where,
            select: {
                totalReward: true,
            },
        });

        const totalOutcome = dayAttendances.reduce((sum, attendance) => sum + attendance.totalReward, 0);

        const responseData = {
            totalIncome,
            totalOutcome,
            totalStudentAttendance: studentAttendances.reduce((sum, attendance) => sum + attendance.totalAttendedStudents, 0),
        };

        return Response.json(responseData, {status: 200});
    } catch (error) {
        console.error(error);
        return Response.json({message: "Error fetching data", status: 400}, {status: 400});
    }
}
