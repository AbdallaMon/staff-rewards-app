import prisma from "@/lib/pirsma/prisma";

export async function GET(request, response) {
    const id = response.params.id;
    const userId = parseInt(id)
    const searchParams = request.nextUrl.searchParams
    const totalShifts = searchParams.get('totalShifts') === 'true';
    const totalRewards = searchParams.get('totalRewards') === 'true';
    const paidDayAttendances = searchParams.get('paidDayAttendances') === 'true';
    const totalHours = searchParams.get('totalHours') === 'true';
    const totalDays = searchParams.get('totalDays') === 'true';

    const startOfYear = new Date(new Date().getFullYear(), 0, 1);
    const endOfYear = new Date(new Date().getFullYear(), 11, 31);

    try {
        let response = {};

        if (totalShifts) {
            const totalShiftsCount = await prisma.attendance.count({
                where: {
                    userId,
                    date: {
                        gte: startOfYear,
                        lte: endOfYear
                    }
                }
            });
            response.totalShifts = totalShiftsCount;
        }

        if (totalRewards) {
            const totalRewardsSum = await prisma.dutyReward.aggregate({
                _sum: {amount: true},
                where: {
                    userId,
                    isPaid: false,
                    date: {
                        gte: startOfYear,
                        lte: endOfYear
                    }
                }
            });
            response.totalRewards = totalRewardsSum._sum.amount || 0;
        }

        if (paidDayAttendances) {
            const paid = await prisma.dayAttendance.count({
                where: {
                    userId,
                    isPaid: true,
                    date: {
                        gte: startOfYear,
                        lte: endOfYear
                    }
                }
            });
            const notPaid = await prisma.dayAttendance.count({
                where: {
                    userId,
                    isPaid: false,
                    date: {
                        gte: startOfYear,
                        lte: endOfYear
                    }
                }
            });
            response.paidDayAttendances = {paid, notPaid};
        }

        if (totalHours) {
            const totalHoursWorked = await prisma.attendance.findMany({
                where: {
                    userId,
                    date: {
                        gte: startOfYear,
                        lte: endOfYear
                    }
                },
                include: {
                    shift: true
                }
            });
            const hours = totalHoursWorked.reduce((sum, attendance) => sum + attendance.shift.duration, 0);
            response.totalHours = hours;
        }

        if (totalDays) {
            const totalDaysAttended = await prisma.dayAttendance.count({
                where: {
                    userId,
                    date: {
                        gte: startOfYear,
                        lte: endOfYear
                    }
                }
            });
            response.totalDays = totalDaysAttended;
        }
        return Response.json(
              response, {status: 200});
    } catch (error) {
        console.error(error);
        return Response.json({message: "error", status: 400}, {status: 400})
    }

}