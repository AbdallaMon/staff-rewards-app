import prisma from "@/lib/pirsma/prisma";

export const getUnpaidDayAttendanceDates = async (startDate, endDate, centerId) => {
    const startOfDay = date => new Date(date.setHours(0, 0, 0, 0));
    const endOfDay = date => new Date(date.setHours(23, 59, 59, 999));

    const where = {
        isPaid: false,
        date: {
            gte: startOfDay(new Date(startDate)),
            lte: endOfDay(new Date(endDate)),
        },
    };


    if (centerId) {
        where.centerId = centerId;
    }

    const dates = await prisma.dayAttendance.findMany({
        where,
        select: {
            date: true,
        },
        distinct: ['date'],
    });
    return {data: dates.map(record => record.date), status: 200}
};

export const markDayAttendancesAsPaid = async (date, centerId) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const where = {
        date: {
            gte: startOfDay,
            lte: endOfDay,
        },
        isPaid: false,
    };

    if (centerId) {
        where.centerId = +centerId;
    }

    await prisma.dayAttendance.updateMany({
        where,
        data: {
            isPaid: true,
        },
    });

    return {status: 200, message: "updated"}
};