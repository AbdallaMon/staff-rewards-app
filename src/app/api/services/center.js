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
                    attachment: true,
                    id: true,
                    userAssignment: {
                        select: {
                            id: true
                        }
                    },
                    user: {
                        select: {
                            name: true,
                            emiratesId: true,
                            totalRating: true
                        },
                    },
                    _count: {
                        select: {attendances: true},
                    },
                },
            }),
            prisma.dayAttendance.count({where}),
        ]);


        return {
            status: 200,
            data: dayAttendanceRecords,
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


export async function createStudentAttendanceRecord({date, centerId, examType, totalAttendedStudents}) {
    try {
        const formattedDate = new Date(date);
        formattedDate.setUTCHours(0, 0, 0, 0);
        date = formattedDate.toISOString()
        const studentAttendance = await prisma.studentAttendance.create({
            data: {
                date: new Date(date).toISOString(),
                centerId: +centerId,
                examType: examType,
                totalAttendedStudents: totalAttendedStudents,
            },
        });

        return {
            status: 200,
            data: studentAttendance,
            message: "Student attendance record created successfully.",
        };
    } catch (error) {
        if (error.code === 'P2002' && error.meta && error.meta.target === 'center_examType_date_unique') {
            return {
                status: 400,
                message: "There is already a record for this date and exam type.",
            };
        }
        return handlePrismaError(error);

    }
}

export async function fetchStudentAttendancesByCenterId(centerId, page, limit, filters = {}) {
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
        const [studentsAttendances, total] = await prisma.$transaction([
            prisma.studentAttendance.findMany({
                where,
                orderBy: {date: 'desc'},
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.studentAttendance.count({where}),
        ]);


        return {
            status: 200,
            data: studentsAttendances,
            total,
            message: "Students Attendances records fetched successfully"
        };
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function updateStudentsAttendanceRecords(studentAttendanceId, body) {
    const {totalAttendedStudents} = body;
    const newStudentAttendance = await prisma.studentAttendance.update({
        where: {
            id: +studentAttendanceId
        },
        data: {
            totalAttendedStudents: +totalAttendedStudents,
        },
    });

    try {
        return {
            status: 200,
            data: newStudentAttendance,
            message: "Students Attendance records updated successfully",
        };
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function getAssignmentsByDayAttendance(dayAttendanceId, isArchived) {
    try {
        let assignments
        // Step 1: Fetch the dayAttendance with related attendance and dutyRewards
        const dayAttendance = await prisma.dayAttendance.findUnique({
            where: {
                id: parseInt(dayAttendanceId),
            },
            include: {
                attendances: {
                    include: {
                        dutyRewards: {
                            include: {
                                duty: true,  // Include the duty to get the dutyId
                            },
                        },
                    },
                },
            },
        });

        // Step 2: Extract the first available dutyId from dutyRewards
        let dutyId = null;
        if (dayAttendance && dayAttendance.attendances.length > 0) {
            // Loop over attendances to find dutyRewards with valid dutyId
            for (const attendance of dayAttendance.attendances) {
                if (attendance.dutyRewards.length > 0) {
                    dutyId = attendance.dutyRewards[0].dutyId;  // Assume first dutyReward dutyId
                    break;
                }
            }
        }

        // If no valid dutyId is found, return an error
        if (!dutyId) {
            return {
                status: 404,
                message: "No duty found for this dayAttendance",
            };
        }
        if (isArchived) {
            assignments = await prisma.assignment.findFirst({
                where: {
                    duties: {
                        some: {
                            dutyId: dutyId,
                        },
                    },
                },
                include: {
                    questions: {
                        include: {
                            choices: true,
                        },
                    },
                },
            });

        } else {
            assignments = await prisma.assignment.findFirst({
                where: {
                    duties: {
                        some: {
                            dutyId: dutyId,
                        },
                    },
                },
                include: {
                    questions: {
                        where: {
                            isArchived: false,
                        },
                        include: {
                            choices: {
                                where: {
                                    isArchived: false,
                                },
                            },
                        },
                    },
                },
            });
        }
        const userRatingData = await prisma.user.findUnique({
            where: {
                id: parseInt(dayAttendance.userId),
            },
            select: {
                totalRating: true,
                lastRatingDate: true,
            },
        });
        assignments.totalRating = userRatingData.totalRating
        assignments.lastRatingDate = userRatingData.lastRatingDate
        assignments.userId = dayAttendance.userId
        return {
            status: 200,
            data: assignments,
        };
    } catch (error) {
        console.log(error, "error");
        return handlePrismaError(error);
    }
}

export async function createUserAssignment(dayAttendanceId, data) {
    const {totalPoints, totalScore, questionAnswers, userId} = data;

    try {
        const updatedUserTotalRating = +totalPoints > 0
              ? (+totalScore / +totalPoints) * 100
              : 0;
        const newUserAssignment = await prisma.userAssignment.create({
            data: {
                dayAttendanceId: parseInt(dayAttendanceId),
                totalPoints: parseInt(totalPoints),
                totalScore: parseInt(totalScore),
                totalRating: updatedUserTotalRating,
                questionAnswers: {
                    create: questionAnswers.map((qa) => ({
                        questionId: qa.questionId,
                        choiceId: qa.choiceId,
                        comment: qa.comment || null,
                    })),
                },
            },
        });

        // Step 2: Retrieve the user's existing totalPoints, totalScore, and totalRating
        const user = await prisma.user.findUnique({
            where: {id: +userId},
            select: {
                totalPoints: true,
                totalScore: true,
            },
        });

        // Step 3: Add new values to the user's existing totalPoints and totalScore
        const updatedTotalPoints = (user.totalPoints || 0) + parseInt(totalPoints);
        const updatedTotalScore = (user.totalScore || 0) + parseInt(totalScore);

        // Step 4: Recalculate totalRating as a percentage
        const updatedTotalRating = updatedTotalPoints > 0
              ? (updatedTotalScore / updatedTotalPoints) * 100
              : 0;

        // Step 5: Update the user with the new totalPoints, totalScore, and totalRating
        const currentDate = new Date();
        await prisma.user.update({
            where: {id: +userId},
            data: {
                lastRatingDate: currentDate,
                totalPoints: updatedTotalPoints,
                totalScore: updatedTotalScore,
                totalRating: parseFloat(updatedTotalRating.toFixed(2)), // Save with 2 decimal points
            },
        });
        newUserAssignment.userTotalRating = updatedTotalRating
        return {
            status: 200,
            message: "UserAssignment created and user updated successfully",
            data: newUserAssignment,
        };
    } catch (error) {
        if (error.code === "P2002" && error.meta.target.includes("dayAttendanceId")) {
            return {
                status: 400,
                message: "The user already has an assignment score for this day. You can modify it from the attendance page.",
            };
        }
        console.log(error, "error");
        return handlePrismaError(error);
    }
}

export async function getUserAssignmentById(userAssignmentId) {
    try {
        const userAssignment = await prisma.userAssignment.findUnique({
            where: {id: parseInt(userAssignmentId)},
            include: {
                questionAnswers: {
                    include: {
                        question: true,
                        choice: true,
                    },
                },
            },
        });

        return {
            status: 200,
            data: userAssignment,
        };
    } catch (error) {
        console.log(error, "error");
        return handlePrismaError(error);
    }
}

export async function deleteUserAssignment(userAssignmentId) {
    try {
        await prisma.userAssignment.delete({
            where: {
                id: parseInt(userAssignmentId),
            },
        });

        return {
            status: 200,
            message: "UserAssignment deleted successfully",
        };
    } catch (error) {
        console.log(error, "error");
        return handlePrismaError(error);
    }
}

export async function editUserAssignment(userAssignmentId, data) {
    let {totalPoints, totalScore, questionAnswers, userId, oldTotals} = data;
    const {totalPoints: oldTotalPoints, totalScore: oldTotalScore} = oldTotals;

    questionAnswers = questionAnswers.filter((question) => question.choiceId !== undefined);

    try {
        const updatedUserAssignment = await prisma.userAssignment.update({
            where: {id: parseInt(userAssignmentId)},
            data: {
                totalPoints: parseInt(totalPoints),
                totalScore: parseInt(totalScore),
                questionAnswers: {
                    deleteMany: {}, // Delete existing answers
                    create: questionAnswers.map((qa) => ({
                        questionId: qa.questionId,
                        choiceId: qa.choiceId,
                        comment: qa.comment || null,
                    })),
                },
            },
        });

        const user = await prisma.user.findUnique({
            where: {id: +userId},
            select: {
                totalPoints: true,
                totalScore: true,
            },
        });

        const updatedTotalPoints = (user.totalPoints || 0) - parseInt(oldTotalPoints) + parseInt(totalPoints);
        const updatedTotalScore = (user.totalScore || 0) - parseInt(oldTotalScore) + parseInt(totalScore);

        const updatedTotalRating = updatedTotalPoints > 0
              ? (updatedTotalScore / updatedTotalPoints) * 100
              : 0;

        await prisma.user.update({
            where: {id: +userId},
            data: {
                totalPoints: updatedTotalPoints,
                totalScore: updatedTotalScore,
                totalRating: parseFloat(updatedTotalRating.toFixed(2)),
            },
        });
        updatedUserAssignment.userTotalRating = updatedTotalRating
        return {
            status: 200,
            message: "UserAssignment updated and user totals recalculated successfully",
            data: updatedUserAssignment,
        };
    } catch (error) {
        console.log(error, "error");
        return handlePrismaError(error);
    }
}


export async function updateUserRatingData(userId, totalRating, lastRatingDate) {
    try {
        const updatedUser = await prisma.user.update({
            where: {
                id: parseInt(userId),
            },
            data: {
                totalRating: parseFloat(totalRating),
                lastRatingDate: new Date(lastRatingDate),
            },
        });

        return {
            status: 200,
            message: "User rating data updated successfully",
            data: updatedUser,
        };
    } catch (error) {
        console.log(error, "error");
        return handlePrismaError(error);
    }
}
