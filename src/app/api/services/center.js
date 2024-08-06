import prisma from "@/lib/pirsma/prisma";
import {handlePrismaError} from "@/app/api/utlis/prismaError";
import {url} from "@/app/constants";
import {sendEmail} from "@/app/api/utlis/sendMail";


export async function fetchUsersByCenterId(centerId, page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    const where = {
        centerId
        , role: "EMPLOYEE",
        accountStatus: "APPROVED",
    };

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
                orderBy: {createdAt: 'desc'},
                select: {
                    id: true,
                    name: true,
                    email: true,
                    emiratesId: true,
                    rating: true,
                    zone: true,
                    phone: true,
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
                },
            }),
            prisma.user.count({where})
        ]);


        return {
            status: 200,
            total,
            data: employees,
            page,
            limit,
            message: "Employees fetched successfully"
        };
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function fetchAttendanceByCenterId(centerId, page, limit, filters = {}) {
    const where = {centerId};

    if (filters.date) {
        const date = new Date(filters.date);
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        where.date = {
            gte: startOfDay,
            lte: endOfDay
        };
    } else {

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
        } else {
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            where.date = {
                gte: startOfMonth,
                lte: endOfMonth
            };
        }
    }
    if (filters.userId) {
        where.userId = +filters.userId
    }

    try {
        const [dayAttendanceRecords, total] = await prisma.$transaction([
            prisma.dayAttendance.findMany({
                where,
                orderBy: {date: 'desc'},
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
                        select: {attendances: true},
                    },
                },
            }),
            prisma.dayAttendance.count({where}),
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
            where: {id: parseInt(dayAttendanceId, 10)},
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
                                id: true
                                , amount: true
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
            return {status: 404, message: "Day Attendance not found"};
        }

        // Fetch all shifts to identify un-attended shifts
        const allShifts = await prisma.shift.findMany({
            where: {
                archived: false
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
                unattendedShifts, allShifts
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
            where: {id: userId},
            data: {rating: +newRating},
            select: {
                id: true,
                name: true,
                email: true,
                emiratesId: true,
                rating: true,
                phone: true,
                zone: true,
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

export async function createAttendanceRecord({userId, shiftIds, duty, date, centerId, examType}) {
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

                  return {attendance, dutyReward};
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
                    connect: attendanceRecords.map(record => ({id: record.attendance.id})),
                },
            },
            create: {
                userId: +userId,
                centerId: +centerId,
                date: new Date(date).toISOString(), // Use full ISO-8601 string
                examType,
                totalReward,
                attendances: {
                    connect: attendanceRecords.map(record => ({id: record.attendance.id})),
                },
            },
        });

        const user = await prisma.user.findUnique({where: {id: +userId}, select: {email: true, name: true}});
        if (user && user.email) {
            const emailContent = `
                <h1>New Attendance Record Created</h1>
                <p>Dear ${user.name},</p>
                <p>An attendance record has been created for you.</p>
                <p><strong>Attended Shifts:</strong> ${shiftIds.length}</p>
                <p><strong>Total Rewards:</strong> ${totalReward}</p>
                <p>Please go to the following link to upload your approval:</p>
                <p><a href="${url}/dashboard/attendance">Upload Your Approval</a></p>
            `;

            await sendEmail(user.email, "New Attendance Record Created", emailContent);
        }

        return {
            status: 200,
            data: {attendanceRecords, dayAttendance},
            message: "Attendance created successfully",
        };
    } catch (error) {
        return handlePrismaError(error);
    }
}


///// edit attendance //////

export async function updateAttendanceRecords(dayAttendanceId, body) {
    const {editedAttendances, deletedAttendances, userId, amount, date, centerId, examType, dutyId} = body
    try {
        // Verify that the dayAttendance exists
        const existingDayAttendance = await prisma.dayAttendance.findUnique({
            where: {id: +dayAttendanceId},
        });

        if (!existingDayAttendance) {
            return {
                status: 400,
                message: "No attendance record found for this date.",
            };
        }

        let totalReward = 0;

        // Delete the specified attendance records and their related duty rewards
        await Promise.all(deletedAttendances.map(async (shiftId) => {
            const attendance = await prisma.attendance.findFirst({
                where: {
                    userId: +userId,
                    shiftId: +shiftId,
                    date: new Date(date),
                    centerId: +centerId,
                    dayAttendanceId: +dayAttendanceId,
                },
            });

            if (attendance) {
                const dutyRewards = await prisma.dutyReward.findMany({
                    where: {attendanceId: attendance.id},
                });

                const rewardSum = dutyRewards.reduce((sum, reward) => sum + reward.amount, 0);
                totalReward -= rewardSum;

                await prisma.dutyReward.deleteMany({
                    where: {attendanceId: attendance.id},
                });

                await prisma.attendance.delete({
                    where: {id: attendance.id},
                });
            }
        }));

        // Create new attendance records for the specified shifts
        const attendanceRecords = await Promise.all(
              editedAttendances.map(async (shiftId) => {
                  const attendance = await prisma.attendance.create({
                      data: {
                          userId: +userId,
                          shiftId: +shiftId,
                          date: new Date(date),
                          centerId: +centerId,
                          dayAttendanceId: +dayAttendanceId,
                      },
                  });
                  const dutyReward = await prisma.dutyReward.create({
                      data: {
                          amount: amount,
                          date: new Date(date),
                          userId: +userId,
                          attendanceId: attendance.id,
                          shiftId: +shiftId,
                          dutyId: +dutyId,
                      },
                  });

                  totalReward += dutyReward.amount;

                  return {attendance, dutyReward};
              })
        );

        await prisma.dayAttendance.update({
            where: {id: +dayAttendanceId},
            data: {
                totalReward: {
                    increment: totalReward,
                },
                attendances: {
                    connect: attendanceRecords.map(record => ({id: record.attendance.id})),
                },
            },
        });


        return {
            status: 200,
            message: "Attendance records updated successfully",
        };
    } catch (error) {
        return handlePrismaError(error);
    }
}
