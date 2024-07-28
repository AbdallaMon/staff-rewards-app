import prisma from "@/lib/pirsma/prisma";
import { handlePrismaError } from "@/app/api/utlis/prismaError";


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
where.role="EMPLOYEE";
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
                    dutyRewards: {
                        select: {
                            amount: true,
                        },
                    },
                },
            }),
            prisma.user.count({ where })
        ]);

        const employeesWithRewards = employees.map(employee => {
            const totalRewards = employee.dutyRewards?.reduce((acc, reward) => acc + reward.amount, 0) || 0;
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
export async function fetchAttendanceByCenterId(centerId, page, limit, filters = {}) {
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
        const [dayAttendanceRecords, total] = await prisma.$transaction([
            prisma.dayAttendance.findMany({
                where,
                orderBy: { date: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
                select: {
                    userId: true,
                    date: true,
                    examType: true,
                    totalReward: true,
                    id: true,
                    user: {
                        select: {
                            name: true,
                            emiratesId: true,
                            rating: true,

                        },
                    },
                    _count: {
                        select: { attendances: true },
                    },
                },
            }),
            prisma.dayAttendance.count({ where }),
        ]);

        const summaryRecords = dayAttendanceRecords.map(record => ({
            userId: record.userId,
            name: record.user.name,
            emiratesId: record.user.emiratesId,
            date: record.date,
            rating: record.user.rating,
            examType: record.examType,
            numberOfShifts: record._count.attendances,
            reward: record.totalReward,
            id: record.id,
        }));

        return {
            status: 200,
            data: summaryRecords,
            total,
            message: "Attendance records fetched successfully"
        };
    } catch (error) {
        return handlePrismaError(error);
    }
}


export async function fetchAttendanceDetailsByDayAttendanceId(dayAttendanceId) {
    try {
        const dayAttendance = await prisma.dayAttendance.findUnique({
            where: { id: parseInt(dayAttendanceId, 10) },
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        emiratesId: true,
                        photo: true,
                        rating: true,
                        duty: {
                            select: {
                                name: true,
                            },

                        }
                    },
                },

                attendances: {
                    include: {
                        shift: {
                            select: {
                                name: true,
                                duration: true,
                            },
                        },
                        dutyRewards: {
                            select: {
                                amount: true,
                                duty: {
                                    select: {
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!dayAttendance) {
            return { status: 404, message: "Day Attendance not found" };
        }

        // Fetch all shifts to identify un-attended shifts
        const allShifts = await prisma.shift.findMany({
            where:{
                archived:false
            },
            select: {
                id: true,
                name: true,
                duration: true,
            },
        });

        const attendedShiftIds = dayAttendance.attendances.map(attendance => attendance.shiftId);
        const unattendedShifts = allShifts.filter(shift => !attendedShiftIds.includes(shift.id));

        return {
            status: 200,
            data: {
                ...dayAttendance,
                unattendedShifts,
            },
            message: "Day Attendance details fetched successfully",
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
                dutyRewards: {
                    select: {
                        amount: true,
                    },
                },
            },
        });

        const totalRewards = updatedEmployee.dutyRewards?.reduce((acc, reward) => acc + reward.amount, 0) || 0;

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

// export async function createAttendanceRecord({ userId, shiftIds, duty, date, centerId, examType }) {
//     try {
//         const dateString = new Date(date).toISOString(); // Use full ISO-8601 string
//         const existingAttendances = [];
//
//         for (const shiftId of shiftIds) {
//             const existingAttendance = await prisma.attendance.findFirst({
//                 where: {
//                     userId: +userId,
//                     date: dateString,
//                     shiftId: +shiftId,
//                     centerId: +centerId,
//                 },
//                 include: {
//                     shift: {
//                         select: {
//                             name: true
//                         }
//                     }
//                 }
//             });
//
//             if (existingAttendance) {
//                 existingAttendances.push(existingAttendance.shift.name);
//             }
//         }
//
//         if (existingAttendances.length > 0) {
//             return {
//                 status: 400,
//                 message: `Attendance already exists for the following shifts: ${existingAttendances.join(', ')}`,
//             };
//         }
//
//         const attendanceRecords = await Promise.all(
//               shiftIds.map(async (shiftId) => {
//                   // Create attendance record
//                   const attendance = await prisma.attendance.create({
//                       data: {
//                           userId: +userId,
//                           shiftId: +shiftId,
//                           date: new Date(date),
//                           centerId: +centerId,
//                       },
//                   });
//
//                   // Create duty reward related to the attendance
//                   const dutyReward = await prisma.dutyReward.create({
//                       data: {
//                           amount: duty.amount,
//                           date: new Date(date),
//                           user: {
//                               connect: {
//                                   id: +userId
//                               }
//                           },
//                           attendance: {
//                               connect: {
//                                   id: attendance.id,
//                               },
//                           },
//                           shift: {
//                               connect: {
//                                   id: +shiftId,
//                               },
//                           },
//                           duty: {
//                               connect: {
//                                   id: +duty.id,
//                               },
//                           },
//                       },
//                   });
//
//                   return { attendance, dutyReward };
//               })
//         );
//
//         // Calculate total reward for the day
//         const totalReward = attendanceRecords.reduce((sum, record) => sum + record.dutyReward.amount, 0);
//
//         const dayAttendance = await prisma.dayAttendance.upsert({
//             where: {
//                 userId_date_centerId: {
//                     userId: +userId,
//                     date: dateString, // Use full ISO-8601 string
//                     centerId: +centerId,
//                 },
//             },
//             update: {
//                 totalReward: {
//                     increment: totalReward,
//                 },
//                 attendances: {
//                     connect: attendanceRecords.map(record => ({ id: record.attendance.id })),
//                 },
//             },
//             create: {
//                 userId: +userId,
//                 centerId: +centerId,
//                 date: dateString, // Use full ISO-8601 string
//                 examType,
//                 totalReward,
//                 attendances: {
//                     connect: attendanceRecords.map(record => ({ id: record.attendance.id })),
//                 },
//             },
//         });
//
//         return {
//             status: 200,
//             data: { attendanceRecords, dayAttendance },
//             message: "Attendance, duty rewards, and day attendance created/updated successfully",
//         };
//     } catch (error) {
//         return handlePrismaError(error);
//     }
// }
export async function createAttendanceRecord({ userId, shiftIds, duty, date, centerId, examType }) {
    try {
        const existingDayAttendance = await prisma.dayAttendance.findFirst({
            where: {
                userId: +userId,
                date: new Date(date).toISOString(),
                centerId: +centerId,
            },
        });

        if (existingDayAttendance) {
            return {
                status: 400,
                message: "Attendance for this user on this date already exists.",
            };
        }
        const attendanceRecords = await Promise.all(
              shiftIds.map(async (shiftId) => {
                  // Create attendance record
                  const attendance = await prisma.attendance.create({
                      data: {
                          userId: +userId,
                          shiftId: +shiftId,
                          date: new Date(date),
                          centerId: +centerId,
                      },
                  });

                  // Create duty reward related to the attendance
                  const dutyReward = await prisma.dutyReward.create({
                      data: {
                          amount: duty.amount,
                          date: new Date(date),
                          user: {
                              connect: {
                                  id: +userId
                              }
                          },
                          attendance: {
                              connect: {
                                  id: attendance.id,
                              },
                          },
                          shift: {
                              connect: {
                                  id: +shiftId,
                              },
                          },
                          duty: {
                              connect: {
                                  id: +duty.id,
                              },
                          },
                      },
                  });

                  return { attendance, dutyReward };
              })
        );

        // Calculate total reward for the day
        const totalReward = attendanceRecords.reduce((sum, record) => sum + record.dutyReward.amount, 0);

        const dayAttendance = await prisma.dayAttendance.upsert({
            where: {
                userId_date_centerId: {
                    userId: +userId,
                    date: new Date(date).toISOString(), // Use full ISO-8601 string
                    centerId: +centerId,
                },
            },
            update: {
                totalReward: {
                    increment: totalReward,
                },
                attendances: {
                    connect: attendanceRecords.map(record => ({ id: record.attendance.id })),
                },
            },
            create: {
                userId: +userId,
                centerId: +centerId,
                date: new Date(date).toISOString(), // Use full ISO-8601 string
                examType,
                totalReward,
                attendances: {
                    connect: attendanceRecords.map(record => ({ id: record.attendance.id })),
                },
            },
        });

        return {
            status: 200,
            data: { attendanceRecords, dayAttendance },
            message: "Attendance, duty rewards, and day attendance created/updated successfully",
        };
    } catch (error) {
        return handlePrismaError(error);
    }
}