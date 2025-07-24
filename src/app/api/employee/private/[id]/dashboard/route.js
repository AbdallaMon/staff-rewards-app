import prisma from "@/lib/pirsma/prisma";

export async function GET(request, response) {
    const id = response.params.id;
    const userId = parseInt(id);
    const searchParams = request.nextUrl.searchParams;
    const totalShifts = searchParams.get('totalShifts') === 'true';
    const totalRewards = searchParams.get('totalRewards') === 'true';
    const paidDayAttendances = searchParams.get('paidDayAttendances') === 'true';
    const totalHours = searchParams.get('totalHours') === 'true';
    const totalDays = searchParams.get('totalDays') === 'true';
    const totalRewardsBreakdown = searchParams.get('totalRewardsBreakdown') === 'true'; // New parameter for total rewards breakdown

    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')) : null;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')) : null;
    const date = searchParams.get('date') ? new Date(searchParams.get('date')) : null;
    const dates = {};
    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        dates.date = {
            gte: startOfDay,
            lte: endOfDay,
        };
    } else if (startDate && endDate) {
        dates.date = {
            gte: startDate,
            lte: endDate,
        };
    }

    try {
        let response = {};

        // Fetch total shifts attended this year
        if (totalShifts) {
            const totalShiftsCount = await prisma.attendance.count({
                where: {
                    userId,
                    ...(dates.date && {date: dates.date}),
                },
            });
            response.totalShifts = totalShiftsCount;
        }

        // Accumulate rewards based on day attendance records
        if (totalRewardsBreakdown || totalRewards) {
            const dayAttendances = await prisma.dayAttendance.findMany({
                where: {
                    userId,
                    ...(dates.date && {date: dates.date}),

                },
                include: {
                    attendances: {
                        include: {
                            dutyRewards: true,
                        },
                    },
                },
            });

            let paidRewards = 0;
            let notPaidRewards = 0;

            // Accumulate rewards based on isPaid flag
            dayAttendances.forEach((dayAttendance) => {
                dayAttendance.attendances.forEach((attendance) => {
                    const totalRewardsForAttendance = attendance.dutyRewards.reduce((sum, reward) => sum + reward.amount, 0);

                    if (dayAttendance.isPaid) {
                        paidRewards += totalRewardsForAttendance;
                    } else {
                        notPaidRewards += totalRewardsForAttendance;
                    }
                });
            });

            if (totalRewardsBreakdown) {
                response.totalRewardsBreakdown = {
                    paid: paidRewards,
                    notPaid: notPaidRewards,
                };
            }

            if (totalRewards) {
                response.totalRewards = paidRewards + notPaidRewards;
            }
        }

        if (paidDayAttendances) {
            const paid = await prisma.dayAttendance.count({
                where: {
                    userId,
                    isPaid: true,
                    ...(dates.date && {date: dates.date}),

                },
            });
            const notPaid = await prisma.dayAttendance.count({
                where: {
                    userId,
                    isPaid: false,
                    ...(dates.date && {date: dates.date}),

                },
            });
            response.paidDayAttendances = {paid, notPaid};
        }

        if (totalHours) {
            const totalHoursWorked = await prisma.attendance.findMany({
                where: {
                    userId,
                    ...(dates.date && {date: dates.date}),

                },
                include: {
                    shift: true,
                },
            });
            const hours = totalHoursWorked.reduce((sum, attendance) => sum + attendance.shift.duration, 0);
            response.totalHours = hours;
        }

        if (totalDays) {
            const totalDaysAttended = await prisma.dayAttendance.count({
                where: {
                    userId,
                    ...(dates.date && {date: dates.date}),

                },
            });
            response.totalDays = totalDaysAttended;
        }

        return Response.json(response, {status: 200});
    } catch (error) {
        console.error(error);
        return Response.json({message: "error", status: 400}, {status: 400});
    }
}
