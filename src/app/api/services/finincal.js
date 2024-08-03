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

export async function getUserBankApproval(page, limit, filters) {
    page = +page;
    limit = +limit;
    const offset = (page - 1) * limit;

    const where = {
        role: "EMPLOYEE",
        accountStatus: "APPROVED"
    };
    if (filters.centerId) {
        where.centerId = parseInt(filters.centerId, 10);
    }
    if (filters.userId) {
        where.id = filters.userId;
    }
    try {
        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                where,
                skip: offset,
                take: limit,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    emiratesId: true,
                    bankApprovalAttachment: true,
                    center: {
                        select: {
                            name: true,
                            id: true,
                        },
                    },
                },
            }),
            prisma.user.count({where}),
        ]);
        return {
            status: 200,
            data: users,
            total,
            page,
            limit,
            message: "users fetched successfully",
        };

    } catch (e) {
        console.log(e, "e")
        return {status: 500, message: "Something wrong happened"}

    }
}

export async function getUserDayAttendancesApprovals(page, limit, filters) {
    page = +page;
    limit = +limit;
    const offset = (page - 1) * limit;

    const where = {};
    if (filters.centerId) {
        where.centerId = parseInt(filters.centerId, 10);
    }
    if (filters.userId) {
        where.userId = filters.userId;
    }
    if (filters.startDate && filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);  // Ensure endDate includes the entire day

        where.date = {
            gte: new Date(filters.startDate),
            lte: endDate
        };
    } else if (filters.startDate) {
        where.date = {
            gte: new Date(filters.startDate)
        };
    } else if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);  // Ensure endDate includes the entire day

        where.date = {
            lte: endDate
        };
    }
    if (filters.type) {
        if (filters.type === 'uploaded') {
            where.attachment = {
                not: {
                    equals: null,
                }
            };
        } else if (filters.type === 'non-uploaded') {
            where.attachment = {
                equals: null,
            };
        }
    }
    try {
        const [dayAttendances, total] = await prisma.$transaction([
            prisma.dayAttendance.findMany({
                where,
                skip: offset,
                take: limit,
                select: {
                    id: true,
                    date: true,
                    attachment: true,
                    user: {
                        select: {
                            name: true,
                            email: true,
                            emiratesId: true,
                            phone: true,
                            center: {
                                select: {
                                    name: true,
                                    id: true,
                                },
                            }
                        }
                    }
                },
                orderBy: {
                    date: 'asc',
                },
            }),
            prisma.dayAttendance.count({where}),
        ]);
        return {
            status: 200,
            data: dayAttendances,
            total,
            page,
            limit,
            message: "Attendences fetched successfully",
        };

    } catch (e) {
        console.log(e, "e")
        return {status: 500, message: "Something wrong happened"}

    }
}