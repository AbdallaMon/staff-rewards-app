import prisma from "@/lib/pirsma/prisma";

export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const centerId = searchParams.get('centerId') ? parseInt(searchParams.get('centerId')) : null;
    const startDate = searchParams.get('startDate') ? new Date(searchParams.get('startDate')) : null;
    const endDate = searchParams.get('endDate') ? new Date(searchParams.get('endDate')) : null;
    const date = searchParams.get('date') ? new Date(searchParams.get('date')) : null;
    const requestType = searchParams.get('type');
    const examType = searchParams.get('examType') || "ALL"; // Default to "ALL"

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
            lte: endOfDay,
        };
    } else if (startDate && endDate) {
        where.date = {
            gte: startDate,
            lte: endDate,
        };
    }

    // Apply examType filter only if it's not "ALL"
    if (examType && examType !== "ALL") {
        where.examType = examType;
    }

    try {
        if (requestType === 'attendance') {
            const centers = centerId
                  ? await prisma.center.findMany({
                      where: {id: centerId},
                      select: {id: true, name: true}
                  })
                  : await prisma.center.findMany({
                      select: {id: true, name: true}
                  });

            const centerData = await Promise.all(
                  centers.map(async (center) => {
                      const studentAttendances = await prisma.studentAttendance.findMany({
                          where: {
                              ...where,
                              centerId: center.id,
                          },
                          select: {
                              examType: true,
                              totalAttendedStudents: true,
                          },
                      });

                      const totalStudents = studentAttendances.reduce((sum, attendance) => sum + attendance.totalAttendedStudents, 0);

                      const totalIncome = studentAttendances.reduce((sum, attendance) => {
                          const rate = attendance.examType === 'TEACHER' ? 50 : 35; // Rate based on exam type
                          return sum + (attendance.totalAttendedStudents * rate);
                      }, 0);

                      const uniqueUsers = await prisma.dayAttendance.findMany({
                          where: {
                              ...where,
                              centerId: center.id,
                          },
                          select: {
                              userId: true,
                          },
                          distinct: ['userId'],
                      });

                      const totalStaff = uniqueUsers.length;
                      const totalOutcome = await prisma.dayAttendance.aggregate({
                          where: {
                              ...where,
                              centerId: center.id,
                          },
                          _sum: {
                              totalReward: true,
                          },
                      });

                      const centerTotalOutcome = totalOutcome._sum.totalReward || 0;

                      return {
                          centerName: center.name,
                          totalStudents,
                          totalStaff,
                          totalIncome,
                          totalOutcome: centerTotalOutcome,
                      };
                  })
            );

            return new Response(JSON.stringify({
                centerData,
            }), {status: 200});
        } else {
            const studentAttendances = await prisma.studentAttendance.findMany({
                where,
                select: {
                    examType: true,
                    totalAttendedStudents: true,
                },
            });

            const totalIncome = studentAttendances.reduce((sum, attendance) => {
                const rate = attendance.examType === 'TEACHER' ? 50 : 35; // Rate based on exam type
                return sum + (attendance.totalAttendedStudents * rate);
            }, 0);

            const dayAttendances = await prisma.dayAttendance.findMany({
                where,
                select: {
                    totalReward: true,
                },
            });

            const totalOutcome = dayAttendances.reduce((sum, attendance) => sum + attendance.totalReward, 0);
            const totalStudentAttendance = studentAttendances.reduce((sum, attendance) => sum + attendance.totalAttendedStudents, 0);

            return new Response(JSON.stringify({
                totalIncome,
                totalOutcome,
                totalStudentAttendance,
            }), {status: 200});
        }
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({message: "Error fetching data", status: 400}), {status: 400});
    }
}
