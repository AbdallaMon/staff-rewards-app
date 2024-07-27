import prisma from "@/lib/pirsma/prisma";

function handlePrismaError(error) {
    console.log(error, "error");
    if (error.code === 'P2002') {
        const target = error.meta.target;
        return { status: 409, message: `Unique constraint failed on the field: ${target}` };
    }
    return { status: 500, message: `Database error: ${error.message}` };
}

export async function fetchUsersByCenterId(centerId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    const where = { centerId };

    if (filters.userId) {
        where.id = +filters.userId;
    }

    if (filters.emiratesId) {
        where.emiratesId = filters.emiratesId;
    }

    if (filters.dutyId) {
        where.dutyId = filters.dutyId;
    }

    try {
        const [employees, total] = await prisma.$transaction([
            prisma.user.findMany({
                where,
                skip: offset,
                take: limit,
                orderBy: { createdAt: 'desc' },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    emiratesId: true,
                    rating: true,
                    center: {
                        select: {
                            name: true,
                            id: true,
                        },
                    },
                    duty: {
                        select: {
                            name: true,
                            id: true,
                        },
                    },
                    attendance: {
                        select: {
                            shift: {
                                select: {
                                    rewards: {
                                        select: {
                                            amount: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            }),
            prisma.user.count({ where })
        ]);

        const employeesWithRewards = employees.map(employee => {
            const totalRewards = employee.attendance?.reduce((acc, attendance) => {
                return acc + attendance.shift.rewards.reduce((shiftAcc, reward) => {
                    return shiftAcc + reward.amount;
                }, 0);
            }, 0) || 0;

            return {
                ...employee,
                totalRewards
            };
        });

        return {
            status: 200,
            data: employeesWithRewards,
            total,
            page,
            limit,
            message: "Employees fetched successfully"
        };
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function fetchAttendanceByCenterId(centerId, filters = {}) {
    const where = { centerId };

    if (filters.startDate && filters.endDate) {
        where.date = {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate)
        };
    } else if (filters.startDate) {
        where.date = {
            gte: new Date(filters.startDate)
        };
    } else if (filters.endDate) {
        where.date = {
            lte: new Date(filters.endDate)
        };
    } else {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        where.date = {
            gte: startOfMonth,
            lte: endOfMonth
        };
    }

    try {
        const [attendanceRecords, total] = await prisma.$transaction([
            prisma.attendance.findMany({
                where,
                orderBy: { date: 'desc' },
            }),
            prisma.attendance.count({ where }),
        ]);

        return {
            status: 200,
            data: attendanceRecords,
            total,
            message: "Attendance records fetched successfully"
        };
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function updateEmployeeRating(userId, newRating) {
    try {
        const updatedEmployee = await prisma.user.update({
            where: { id: userId },
            data: { rating: +newRating },
            select: {
                id: true,
                name: true,
                email: true,
                emiratesId: true,
                rating: true,
                center: {
                    select: {
                        name: true,
                        id: true,
                    },
                },
                duty: {
                    select: {
                        name: true,
                        id: true,
                    },
                },
                attendance: {
                    select: {
                        shift: {
                            select: {
                                rewards: {
                                    select: {
                                        amount: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        const totalRewards = updatedEmployee.attendance?.reduce((acc, attendance) => {
            return acc + attendance.shift.rewards.reduce((shiftAcc, reward) => {
                return shiftAcc + reward.amount;
            }, 0);
        }, 0) || 0;

        updatedEmployee.totalRewards = totalRewards;

        return {
            status: 200,
            data: updatedEmployee,
            message: "Employee rating updated successfully"
        };
    } catch (error) {
        return handlePrismaError(error);
    }
}
