import prisma from "@/lib/pirsma/prisma";

export async function GET(request, response) {
    const searchParams = request.nextUrl.searchParams;
    const centerId = searchParams.get('centerId') ? parseInt(searchParams.get('centerId')) : null;
    const totalCenters = searchParams.get('totalCenters') ? true : false;
    const totalUsers = searchParams.get('totalUsers') ? true : false;
    const totalAttendances = searchParams.get('totalAttendances') ? true : false;
    const totalDayAttendances = searchParams.get('totalDayAttendances') ? true : false;
    const totalCalendars = searchParams.get('totalCalendars') ? true : false;
    const totalRewards = searchParams.get('totalRewards') ? true : false;
    const paidRewards = searchParams.get('paidRewards') ? true : false;
    const unpaidRewards = searchParams.get('unpaidRewards') ? true : false;
    const examsSummary = searchParams.get('examsSummary') ? true : false;
    const userStatus = searchParams.get('userStatus') ? true : false
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);
    const today = new Date();
    try {
        const responseData = {};

        if (totalCenters) {
            responseData.totalCenters = await prisma.center.count();
        }

        if (totalUsers) {
            responseData.totalUsers = await prisma.user.count({
                where: {
                    role: "EMPLOYEE",
                    ...(centerId && {centerId})
                }
            });
        }

        if (totalAttendances) {
            responseData.totalAttendances = await prisma.attendance.count({
                where: {
                    ...(centerId && {centerId}),
                    date: {
                        gte: startOfYear,
                        lte: endOfYear
                    },
                }
            });
        }

        if (totalDayAttendances) {
            responseData.totalDayAttendances = await prisma.dayAttendance.count({
                where: {
                    ...(centerId && {centerId}),
                    date: {
                        gte: startOfYear,
                        lte: endOfYear
                    },
                }
            });
        }

        if (totalRewards) {
            const rewards = await prisma.dutyReward.aggregate({
                _sum: {amount: true},
                where: {
                    ...(centerId && {attendance: {centerId}}),
                    date: {
                        gte: startOfYear,
                        lte: endOfYear
                    },
                }
            });
            responseData.totalRewards = rewards._sum.amount || 0;
        }

        if (paidRewards) {
            const rewards = await prisma.dutyReward.aggregate({
                _sum: {amount: true},
                where: {
                    attendance: {
                        dayAttendance: {
                            isPaid: true,
                            ...(centerId && {centerId}),

                        }
                    },
                    date: {
                        gte: startOfYear,
                        lte: endOfYear
                    },
                }
            });
            responseData.paidRewards = rewards._sum.amount || 0;
        }

        if (unpaidRewards) {
            const rewards = await prisma.dutyReward.aggregate({
                _sum: {amount: true},
                where: {
                    attendance: {
                        dayAttendance: {
                            isPaid: false,
                            ...(centerId && {centerId}),
                        }
                    },
                    date: {
                        gte: startOfYear,
                        lte: endOfYear
                    },
                }
            });
            responseData.unpaidRewards = rewards._sum.amount || 0;
        }

        if (totalCalendars) {
            responseData.totalCalendars = await prisma.calendar.count({
                where: {
                    date: {
                        gte: startOfYear,
                        lte: endOfYear
                    }
                }
            });
        }
        if (examsSummary) {
            const comingExams = await prisma.calendar.count({
                where: {
                    date: {
                        gte: today,
                        lte: endOfYear,
                    },
                },
            });

            const oldExams = await prisma.calendar.count({
                where: {
                    date: {
                        lte: today,
                        gte: startOfYear,
                    },
                },
            });

            responseData.comingExams = comingExams;
            responseData.oldExams = oldExams;
        }

        if (userStatus) {
            const activeUsers = await prisma.user.count({
                where: {
                    emailConfirmed: true,
                    role: "EMPLOYEE",

                    accountStatus: "APPROVED",
                    ...(centerId && {centerId}),
                }
            });
            const uncompletedUsers = await prisma.user.count({
                where: {
                    accountStatus: "UNCOMPLETED", role: "EMPLOYEE",

                    ...(centerId && {centerId}),
                }
            });
            const pendingUsers = await prisma.user.count({
                where: {
                    accountStatus: "PENDING", role: "EMPLOYEE",

                    ...(centerId && {centerId}),
                }
            });
            responseData.activeUsers = activeUsers;
            responseData.uncompletedUsers = uncompletedUsers;
            responseData.pendingUsers = pendingUsers;
        }
        return Response.json(responseData, {status: 200});
    } catch (error) {
        console.error(error);
        return Response.json({message: "Error fetching dashboard data", status: 400}, {status: 400});
    }
}
