import prisma from "@/lib/pirsma/prisma";
import {handlePrismaError} from "@/app/api/utlis/prismaError";

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
        where.centerId = +centerId;
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
                    attendances: {
                        select: {
                            center: {
                                select: {
                                    name: true,
                                }
                            }
                        }
                    },
                    user: {
                        select: {
                            id: true,
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


///

export async function fetchAttendanceForFinincial(page, limit, filters = {}) {
    const where = {};
    if (filters.centerId) {
        where.centerId = +filters.centerId
    }
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

export async function updateAttendanceRecordsWithLog(dayAttendanceId, body, loggerId) {
    const {
        editedAttendances,
        deletedAttendances,
        userId,
        amount,
        date,
        centerId,
        dutyId,
        email,
        name,
        emiratesId,
        allShifts,
        oldAttendances
    } = body;
    try {
        const existingDayAttendance = await prisma.dayAttendance.findUnique({
            where: {id: +dayAttendanceId},
            include: {
                attendances: {
                    include: {
                        shift: true
                    }
                }
            }
        });
        let initialTotalReward = existingDayAttendance.totalReward;
        let totalRewardChange = 0;
        const logger = await prisma.user.findUnique({
            where: {id: +loggerId},
            select: {name: true, email: true},
        });

        if (!logger) {
            return {
                status: 400,
                message: "User or Logger not found.",
            };
        }
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
                totalRewardChange -= rewardSum;

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

                  totalRewardChange += dutyReward.amount;

                  return {attendance, dutyReward};
              })
        );

        await prisma.dayAttendance.update({
            where: {id: +dayAttendanceId},
            data: {
                totalReward: {
                    increment: totalRewardChange,
                },
                attachment: null,
                attendances: {
                    connect: attendanceRecords.map(record => ({id: record.attendance.id})),
                },
            },
        });

        // Get shift names
        const allShiftNames = allShifts.reduce((acc, shift) => {
            acc[shift.id] = shift.name;
            return acc;
        }, {});
        const oldAttendanceShiftNames = oldAttendances.map(attendance => attendance.shift.name);
        const deletedShiftNames = deletedAttendances.map(id => allShiftNames[id]);
        const editedShiftNames = editedAttendances.map(id => allShiftNames[id]);

        // Create the log entry
        const logDescription = `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <p>Attendance records updated by <strong>${logger.name} (${logger.email})</strong></p>
                <p><strong>Employee:</strong> ${name} (${email}, Emirates ID: ${emiratesId})</p>
                <div>
                    <strong>Changes:</strong>
                    <ul>
                        <li><strong>Total Previous Attendances:</strong> ${oldAttendanceShiftNames.join(", ")}</li>
                        <li><strong>Deleted Attendances:</strong> ${deletedShiftNames.join(", ")}</li>
                        <li><strong>New Attendances:</strong> ${editedShiftNames.join(", ")}</li>
                    </ul>
                </div>
                <div>
                    <strong>Rewards:</strong>
                    <ul>
                        <li><strong>Total Reward Before:</strong> ${initialTotalReward}</li>
                        <li><strong>Total Reward After:</strong> ${initialTotalReward + totalRewardChange}</li>
                    </ul>
                </div>
            </div>
        `;
        await prisma.log.create({
            data: {
                userId: +loggerId,
                action: 'UPDATE_ATTENDANCE',
                description: logDescription,
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

export async function getAttendanceData(date, centerId) {
    try {

        const where = {
            date: new Date(date),
        };

        if (centerId) {
            where.centerId = +centerId;
        }

        const attendanceData = await prisma.dayAttendance.findMany({
            where,
            select: {
                date: true,
                totalReward: true,
                center: {
                    select: {
                        name: true
                    }
                },
                user: {
                    select: {
                        name: true,
                        emiratesId: true,
                        center: {
                            select: {
                                name: true
                            }
                        },
                        duty: {
                            select: {
                                name: true,
                                amount: true
                            }
                        }
                    }
                },
                attendances: {
                    select: {
                        shift: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            }
        });

        return {data: attendanceData, status: 200};
    } catch (e) {
        return handlePrismaError(e)
    }
}

export async function getBankDetailsData(date, centerId) {
    try {
        const where = {
            date: new Date(date),
        };

        if (centerId) {
            where.centerId = +centerId;
        }

        const bankDetailsData = await prisma.dayAttendance.findMany({
            where,
            select: {
                date: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                        bankName: true,
                        bankUserName: true,
                        ibanBank: true,
                    },
                },
            },
        });

        return {data: bankDetailsData, status: 200};
    } catch (e) {
        return handlePrismaError(e);
    }
}
