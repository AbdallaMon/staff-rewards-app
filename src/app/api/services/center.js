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
                    attachment: true,
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
            attachment: record.attachment
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
                                        id: true,
                                        name: true,
                                        amount: true
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
        const existingAttendances = await prisma.attendance.findMany({
            where: {
                userId: +userId,
                date: new Date(date).toISOString(),
                centerId: +centerId,
                shiftId: {in: shiftIds},
            },
            include: {
                shift: {
                    select: {name: true},
                },
            },
        });

        if (existingAttendances.length > 0) {
            const existingShiftNames = existingAttendances.map((attendance) => attendance.shift.name).join(", ");
            return {
                status: 400,
                message: `The following shifts have already been attended: ${existingShiftNames}. Please change or edit these shifts.`,
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
                                  id: +userId,
                              },
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

        const dayAttendance = await prisma.dayAttendance.create({
            data: {
                userId: +userId,
                centerId: +centerId,
                date: new Date(date).toISOString(),
                examType,
                totalReward,
                attendances: {
                    connect: attendanceRecords.map((record) => ({id: record.attendance.id})),
                },
            },
        })

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
        if (error.code === 'P2002' && error.meta && error.meta.target === 'Attendance_userId_shiftId_date_unique') {
            return {
                status: 400,
                message: `Attendance record already exists for the selected shift on the specified date.`,
            };
        }
        return handlePrismaError(error);
    }
}


///// edit attendance //////

export async function updateAttendanceRecords(dayAttendanceId, body) {
    const {editedAttendances, deletedAttendances, userId, amount, date, centerId, dutyId} = body;

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

        if (error.code === 'P2002' && error.meta && error.meta.target === 'Attendance_userId_shiftId_date_unique') {
            return {
                status: 400,
                message: `Attendance record already exists for the selected shift on the specified date.`,
            };
        }
        return handlePrismaError(error);
    }
}

export async function deleteAttendanceRecord(dayAttendanceId) {
    dayAttendanceId = +dayAttendanceId
    try {
        // Delete related DutyRewards
        await prisma.dutyReward.deleteMany({
            where: {
                attendanceId: {
                    in: (await prisma.attendance.findMany({
                        where: {dayAttendanceId},
                        select: {id: true}
                    })).map(attendance => attendance.id)
                }
            }
        });

        // Delete related Attendance records
        await prisma.attendance.deleteMany({
            where: {
                dayAttendanceId
            }
        });

        // Delete DayAttendance record
        await prisma.dayAttendance.delete({
            where: {
                id: +dayAttendanceId
            }
        });
        return {
            status: 200, message: "Attendance deleted successfullu"
        }
    } catch (error) {
        console.log(error, "error")
        return handlePrismaError(error);
    }
}

export async function deleteAttendanceRecordWithLog(dayAttendanceId, loggerId) {
    dayAttendanceId = +dayAttendanceId;
    try {
        // Get the details of the records to be deleted for logging
        const existingDayAttendance = await prisma.dayAttendance.findUnique({
            where: {id: dayAttendanceId},
            include: {
                attendances: {
                    include: {
                        dutyRewards: true,
                        shift: true,
                    },
                },
                // Include user details to get the user who had the records
                user: true,
            },
        });

        if (!existingDayAttendance) {
            return {
                status: 404,
                message: "DayAttendance record not found.",
            };
        }

        // Prepare log data
        const logger = await prisma.user.findUnique({
            where: {id: +loggerId},
            select: {name: true, email: true},
        });

        if (!logger) {
            return {
                status: 400,
                message: "Logger not found.",
            };
        }

        const deletedAttendances = existingDayAttendance.attendances;
        const deletedDutyRewards = deletedAttendances.flatMap(attendance => attendance.dutyRewards);

        // Calculate total reward change
        const totalRewardChange = deletedDutyRewards.reduce((sum, reward) => sum + reward.amount, 0);

        // Prepare the log description
        const logDescription = `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <p>Attendance records deleted by <strong>${logger.name} (${logger.email})</strong></p>
                <p><strong>Deleted for User:</strong> ${existingDayAttendance.user.name} (${existingDayAttendance.user.email})</p>
                <div>
                    <strong>Deleted Records:</strong>
                    <ul>
                        <li><strong>Shifts:</strong> ${deletedAttendances.map(att => `${att.shift.name}`).join(", ")}</li>
                        <li><strong>Duty Rewards Total:</strong> ${totalRewardChange}</li>
                    </ul>
                </div>
            </div>
        `;


        // Delete related DutyRewards
        await prisma.dutyReward.deleteMany({
            where: {
                attendanceId: {
                    in: deletedAttendances.map(attendance => attendance.id),
                },
            },
        });

        // Delete related Attendance records
        await prisma.attendance.deleteMany({
            where: {
                dayAttendanceId,
            },
        });

        // Delete DayAttendance record
        await prisma.dayAttendance.delete({
            where: {
                id: dayAttendanceId,
            },
        });
        await prisma.log.create({
            data: {
                userId: +loggerId,
                action: 'DELETE_ATTENDANCE',
                description: logDescription,
            },
        });

        return {
            status: 200,
            message: "Attendance deleted successfully",
        };
    } catch (error) {
        return handlePrismaError(error);
    }
}
