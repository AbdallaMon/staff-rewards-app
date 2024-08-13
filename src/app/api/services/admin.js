import prisma from "@/lib/pirsma/prisma";
import bcrypt from "bcrypt";
import {sendEmail} from "@/app/api/utlis/sendMail";
import {url} from "@/app/constants";
import {handlePrismaError} from "@/app/api/utlis/prismaError";
import jwt from "jsonwebtoken";
import {generateResetToken} from "@/app/api/utlis/utility";
// Helper function to handle Prisma errors


////// Shifts //////
export async function fetchShifts(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    try {
        const [shifts, total] = await prisma.$transaction([
            prisma.shift.findMany({
                skip: offset,
                take: limit,
                orderBy: {createdAt: 'desc'},
                where: {archived: false}
            }),
            prisma.shift.count({where: {archived: false}}),
        ]);
        return {
            status: 200,
            data: shifts,
            total,
            page,
            limit,
            message: "Shifts fetched successfully",
        };
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function createShift(data) {
    try {
        const newShift = await prisma.shift.create({
            data: {
                name: data.name,
                duration: +data.duration,
            },
        });
        return {status: 200, data: newShift, message: "Shift created successfully"};
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function editShift(id, data) {
    try {
        const updatedShift = await prisma.shift.update({
            where: {id: parseInt(id, 10)},
            data: {
                name: data.name,
                duration: +data.duration,
            },
        });
        return {status: 200, data: updatedShift, message: "Shift updated successfully"};
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function deleteShift(id) {
    try {
        const deletedShift = await prisma.shift.delete({
            where: {id: parseInt(id, 10)},
        });
        return {status: 200, data: deletedShift, message: "Shift deleted successfully"};
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function archiveShift(id) {
    try {
        const archivedShift = await prisma.shift.update({
            where: {id: parseInt(id, 10)},
            data: {archived: true},
        });
        return {status: 200, data: archivedShift, message: "Shift archived successfully"};
    } catch (error) {
        return handlePrismaError(error);
    }
}

///// Duties //////
export async function fetchDuties(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    try {
        const [duties, total] = await prisma.$transaction([
            prisma.duty.findMany({
                skip: offset,
                take: limit,
                orderBy: {createdAt: 'desc'},
                where: {archived: false}
            }),
            prisma.duty.count({where: {archived: false}}),
        ]);
        return {
            status: 200,
            data: duties,
            total,
            page,
            limit,
            message: "Duties fetched successfully",
        };
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function createDuty(data) {
    try {
        const newDuty = await prisma.duty.create({
            data: {
                name: data.name,
                amount: +data.amount,
            },
        });
        return {status: 200, data: newDuty, message: "Duty created successfully"};
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function editDuty(id, data) {
    try {
        const updatedDuty = await prisma.duty.update({
            where: {id: parseInt(id, 10)},
            data: {
                name: data.name,
                amount: +data.amount,
            },
        });
        return {status: 200, data: updatedDuty, message: "Duty updated successfully"};
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function deleteDuty(id) {
    try {
        const deletedDuty = await prisma.duty.delete({
            where: {id: parseInt(id, 10)},
        });
        return {status: 200, data: deletedDuty, message: "Duty deleted successfully"};
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function archiveDuty(id) {
    try {
        const archivedDuty = await prisma.duty.update({
            where: {id: parseInt(id, 10)},
            data: {archived: true},
        });
        return {status: 200, data: archivedDuty, message: "Duty archived successfully"};
    } catch (error) {
        return handlePrismaError(error);
    }
}

// Center

export async function createCenter(data) {
    const actualPassword = data.password;
    if (data.password) {
        // Validate password
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!passwordRegex.test(data.password)) {
            return {
                status: 400,
                message: "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number."
            };
        }
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);

    try {
        const newUser = await prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                role: "CENTER",
                isActive: true,
                emailConfirmed: true,
            },
        });

        const newCenter = await prisma.center.create({
            data: {
                name: data.name,
                centerId: data.centerId,
                zone: data.zone,
                email: data.email,
                supervisorEmail: data.supervisorEmail,
                centerAdmin: {
                    connect: {id: newUser.id}
                }
            },
        });

        const emailContent = `
            <h1>Your Center Account Details</h1>
            <p>Your account has been created successfully.</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Password:</strong> ${actualPassword}</p>
            <p><a href="${url}/login">Click here to login</a></p>
        `;

        await sendEmail(
              data.supervisorEmail,
              "Your Center Account Details",
              emailContent
        );

        return {status: 200, data: newCenter, message: "Center created successfully and email sent to supervisor."};
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function editCenter(id, data) {
    try {
        if (data.password) {
            // Validate password
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            if (!passwordRegex.test(data.password)) {
                return {
                    status: 400,
                    message: "Password must be at least 8 characters long, contain at least one uppercase letter, one lowercase letter, and one number."
                };
            }
        }
        const updates = {...data};
        const userUpdates = {
            email: data.email
        }
        // Handle password
        if (data.password) {
            userUpdates.password = await bcrypt.hash(data.password, 10);
        }
        delete updates.password;


        const updatedCenter = await prisma.center.update({
            where: {id: parseInt(id, 10)},
            data: updates,
        });
        if (!data.email) {
            delete userUpdates.email;
        }
        if (userUpdates.password) {
            await prisma.user.update({
                where: {id: +updatedCenter.adminUserId},
                data: userUpdates,
            });
        }
        if (data.email) {
            await prisma.user.update({
                where: {id: +updatedCenter.adminUserId},
                data: userUpdates,
            });

            const emailContent = `
                <h1>Your Center Account Email Updated</h1>
                <p>The email for your center account has been updated.</p>
                <p><strong>New Email:</strong> ${data.email}</p>
                <p><a href="${url}/login">Click here to login</a></p>
            `;

            // Send email to the supervisor with the new email
            await sendEmail(
                  updatedCenter.supervisorEmail,
                  "Your Center Account Email Updated",
                  emailContent
            );
        }

        return {status: 200, data: updatedCenter, message: "Center updated successfully"};
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function fetchCenters(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    try {
        const [centers, total] = await prisma.$transaction([
            prisma.center.findMany({
                skip: offset,
                take: limit,
                orderBy: {createdAt: 'desc'},
            }),
            prisma.center.count(),
        ]);

        return {
            status: 200,
            data: centers,
            total,
            page,
            limit,
            message: "Centers fetched successfully",
        };
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function deleteCenter(id) {
    try {

        const deletedCenter = await prisma.center.delete({
            where: {id: parseInt(id, 10)},
        });
        const deletedUser = await prisma.user.delete({
            where: {id: deletedCenter.adminUserId},
        });

        return {status: 200, data: deletedCenter, message: "Center and associated admin user deleted successfully"};
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function fetchEmployees(page = 1, limit = 10, employRequests = false, rejected = false, centerId, uncompleted, dutyId, userId) {
    const offset = (page - 1) * limit;
    let requestStatus = employRequests ? "PENDING" : "APPROVED";
    if (rejected) {
        requestStatus = "REJECTED";
    }
    if (uncompleted) {
        requestStatus = "UNCOMPLETED";
    }
    const where = {
        role: 'EMPLOYEE',
        accountStatus: requestStatus,
        centerId: centerId ? parseInt(centerId, 10) : undefined,
    };
    if (!uncompleted) {
        where.emailConfirmed = true;
    }
    if (dutyId) {
        where.dutyId = +dutyId
    }
    if (userId) {
        where.id = +userId;
    }
    try {
        const [employees, total] = await prisma.$transaction([
            prisma.user.findMany({
                where: where,
                skip: offset,
                take: limit,
                select: {
                    rejectedReason: requestStatus === "REJECTED",
                    id: true,
                    name: true,
                    email: true,
                    emiratesId: true,
                    rating: true,
                    zone: true,
                    phone: true,
                    bankName: true,
                    bankUserName: true,
                    ibanBank: true,
                    graduationName: true,
                    passportNumber: true,
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
                orderBy: {createdAt: 'desc'},
            }),
            prisma.user.count({where: {role: 'EMPLOYEE', accountStatus: requestStatus}})
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
            message: "Employees fetched successfully",
        };
    } catch (error) {
        return handlePrismaError(error);
    }
}


export async function EditEmploy(employId, data) {
    if (data.centerId) {
        data.centerId = parseInt(data.centerId, 10);
    }
    if (data.dutyId) {
        data.dutyId = parseInt(data.dutyId, 10);
    }
    if (data.rating) {
        data.rating = parseInt(data.rating, 10);
    }
    try {
        const updatedEmploy = await prisma.user.update({
            where: {id: parseInt(employId, 10)},
            data: {
                ...data
            },
            select: {
                id: true,
                name: true,
                email: true,
                emiratesId: true,
                rating: true,
                zone: true,
                phone: true,
                bankName: true,
                bankUserName: true,
                ibanBank: true,
                graduationName: true,
                passportNumber: true,
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
        const totalRewards = updatedEmploy.dutyRewards?.reduce((acc, reward) => acc + reward.amount, 0) || 0;

        return {
            status: 200,
            data: {
                ...updatedEmploy,
                totalRewards
            },
            message: "Employee updated successfully"
        }

    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function getUserById(id) {
    try {
        const user = await prisma.user.findUnique({
            where: {id: parseInt(id, 10)},
            include: {
                center: true,
                duty: true,
                dutyRewards: true,
            }
        });

        if (!user) {
            return {status: 404, message: "User not found"};
        }

        return {status: 200, data: user, message: "User fetched successfully"};
    } catch (error) {
        return handlePrismaError(error);
    }
}

///// employees requests /////

export const approveUser = async (userId) => {
    try {
        const user = await prisma.user.update({
            where: {id: userId},
            data: {
                accountStatus: 'APPROVED',
            },
        });
        const emailHtml = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
            <h2 style="color: #7c5e24;"> Account Approved </h2>
            <p> "Your account has been approved , your email is: <strong>${user.email}</strong></p>
            <div>You can click this button to login directly
                        <a href="${url}/login" style="display: inline-block; margin: 10px 0; padding: 10px 20px; background-color: #7c5e24; color: #ffffff; text-decoration: none; border-radius: 5px;">Login</a>
            </div>
            <p>If you need to generate a new password, you can do so at any time by visiting <a href="${url}/reset" style="color: #7c5e24;">this link</a>.</p>
        </div>
    `;

        await sendEmail(
              user.email,
              "Your Account Details",
              emailHtml
        );

        return {status: 200, message: 'User approved successfully and a message sent to the user email '};
    } catch (error) {
        console.error('Error approving user:', error);
        return handlePrismaError(error);
    }
};

export const rejectUser = async (userId, {reason}) => {
    try {
        const user = await prisma.user.update({
            where: {id: userId},
            data: {accountStatus: 'REJECTED', rejectedReason: reason},
        });

        const emailContent = `
      <h1>Account Rejected</h1>
      <p>Your account has been rejected for the following reason:</p>
      <p>${reason}</p>
    `;

        await sendEmail(user.email, 'Account Rejected', emailContent);

        return {status: 200, message: 'User rejected and a message with the reason sent to his email'};
    } catch (error) {
        console.error('Error rejecting user:', error);
        return handlePrismaError(error);
    }
};

export const uncompletedUser = async (userId, {checks, comments}, baseUrl) => {
    try {
        const user = await prisma.user.update({
            where: {id: userId},
            data: {accountStatus: 'UNCOMPLETED'},
        });

        const tokenPayload = {
            userId: userId,
            email: user.email,
            checks: checks.map((check) => ({
                id: check.id,
                label: check.label,
                comment: check.comment || 'No comment provided',
            })),
        };
        const SECRET_KEY = process.env.SECRET_KEY;

        const token = jwt.sign(tokenPayload, SECRET_KEY, {expiresIn: '30d'});
        const emailContent = `
            <h1>Account Registration Incomplete</h1>
            <p>Your account registration is incomplete for the following reasons:</p>
            <ul>
                ${checks.map(check => `<li><strong>${check.label}:</strong> ${check.comment || 'No comment provided'}</li>`).join('')}
            </ul>
            <p><a href="${baseUrl}/uncompleted?token=${token}">Click here to complete your registration</a></p>
        `;

        await sendEmail(user.email, 'Account Registration Incomplete', emailContent);

        return {
            status: 200,
            message: 'User marked as uncompleted and a message with uncompleted details sent with link'
        };
    } catch (error) {
        console.error('Error marking user as uncompleted:', error);
        return handlePrismaError(error);
    }
};

///// calendar //////
export async function fetchCalendars(page = 1, limit = 10, filters = {}) {
    const offset = (page - 1) * limit;
    const where = {};

    if (filters.examType) {
        where.examType = filters.examType;
    }
    if (filters.month && filters.year) {
        const startDate = new Date(filters.year, filters.month - 1, 1);
        const endDate = new Date(filters.year, filters.month, 0);
        where.date = {
            gte: startDate,
            lte: endDate,
        };
    } else {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        where.date = {
            gte: startDate,
            lte: endDate,
        };
    }

    try {
        const [calendars, total] = await prisma.$transaction([
            prisma.calendar.findMany({
                where,
                skip: offset,
                take: limit,
                orderBy: {date: 'desc'},
            }),
            prisma.calendar.count({where}),
        ]);

        return {
            status: 200,
            data: calendars,
            total,
            page,
            limit,
            message: "Calendars fetched successfully",
        };
    } catch (error) {
        return handlePrismaError(error);
    }
}

// Create a new calendar entry
export async function createCalendar(data) {
    try {
        const existingCalendar = await prisma.calendar.findFirst({
            where: {
                examType: data.examType,
                date: new Date(data.date).toISOString()
            },
        });

        if (existingCalendar) {
            return {
                status: 400,
                message: "A calendar entry for this exam type and date already exists.",
            };
        }
        const newCalendar = await prisma.calendar.create({
            data: {
                date: new Date(data.date),
                examType: data.examType,
            },
        });
        return {status: 200, data: newCalendar, message: "Calendar entry created successfully"};
    } catch (error) {
        return handlePrismaError(error);
    }
}

// Edit an existing calendar entry
export async function editCalendar(id, data) {
    try {
        const updatedCalendar = await prisma.calendar.update({
            where: {id: parseInt(id, 10)},
            data: {
                date: new Date(data.date),
                examType: data.examType,
            },
        });
        return {status: 200, data: updatedCalendar, message: "Calendar entry updated successfully"};
    } catch (error) {
        return handlePrismaError(error);
    }
}

// Delete a calendar entry
export async function deleteCalendar(id) {
    try {
        // Find the calendar entry to get the date and examType
        const calendar = await prisma.calendar.findUnique({
            where: {id: parseInt(id, 10)},
            select: {
                date: true,
                examType: true,
            },
        });

        if (!calendar) {
            return {status: 404, message: "Calendar entry not found"};
        }

        // Check for related dayAttendance
        const relatedDayAttendance = await prisma.dayAttendance.findFirst({
            where: {
                date: calendar.date,
                examType: calendar.examType,
            },
        });

        if (relatedDayAttendance) {
            return {
                status: 400,
                message: "Cannot delete calendar entry. There is a related dayAttendance for the same date and examType.",
            };
        }

        // Delete the calendar entry if no related dayAttendance is found
        const deletedCalendar = await prisma.calendar.delete({
            where: {id: parseInt(id, 10)},
        });

        return {status: 200, data: deletedCalendar, message: "Calendar entry deleted successfully"};
    } catch (error) {
        return handlePrismaError(error);
    }
}

//// financial accounts
export async function createFinancialAccount(data) {

    try {
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                role: "FINANCIAL_AUDITOR",
                isActive: true,
                emailConfirmed: true,
            },
        });
        await generateResetToken(user.email)

        return {status: 200, data: user, message: "Account created successfully and email sent to the account."};
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function fetchFinancialAccounts(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    try {
        const where = {
            role: "FINANCIAL_AUDITOR"
        }
        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                where,
                skip: offset,
                take: limit,
                orderBy: {createdAt: 'desc'},
            }),
            prisma.user.count({where}),
        ]);

        return {
            status: 200,
            data: users,
            total,
            page,
            limit,
            message: "Users fetched successfully",
        };
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function deleteFinancialAccount(id) {
    try {
        await prisma.log.deleteMany({
            where: {userId: parseInt(id, 10)},
        });
        const deletedUser = await prisma.user.delete({
            where: {id: parseInt(id, 10)},
        });

        return {status: 200, data: deletedUser, message: "User deleted "};
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function editFinancialAccount(id, data) {
    try {

        const newUser = await prisma.user.update({
            where: {id: +id},
            data,
        });
        if (data.email) {
            if (data.email !== newUser.email) {
                const emailContent = `
                <h1>Your Account Email Updated</h1>
                <p>The email for your account has been updated.</p>
                <p><strong>New Email:</strong> ${data.email}</p>
                <p><a href="${url}/login">Click here to login</a></p>
            `;

                // Send email to the supervisor with the new email
                await sendEmail(
                      data.email,
                      "Your Account Email Updated",
                      emailContent
                );
            }
        }

        return {status: 200, data: newUser, message: "account updated successfully"};
    } catch (error) {
        return handlePrismaError(error);
    }
}


/// admins
//// financial accounts
export async function createAdminAccount(data) {

    try {
        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                role: "ADMIN",
                isActive: true,
                emailConfirmed: true,
            },
        });
        await generateResetToken(user.email)

        return {status: 200, data: user, message: "Account created successfully and email sent to the account."};
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function fetchAdminsAccounts(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    try {
        const where = {
            role: "ADMIN"
        }
        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                where,
                skip: offset,
                take: limit,
                orderBy: {createdAt: 'desc'},
            }),
            prisma.user.count({where}),
        ]);

        return {
            status: 200,
            data: users,
            total,
            page,
            limit,
            message: "Users fetched successfully",
        };
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function deleteAdminAccount(id) {
    try {
        const deletedUser = await prisma.user.delete({
            where: {id: parseInt(id, 10)},
        });
        return {status: 200, data: deletedUser, message: "User deleted "};
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function editAdminAccount(id, data) {
    try {

        const newUser = await prisma.user.update({
            where: {id: +id},
            data,
        });
        if (data.email) {
            if (data.email !== newUser.email) {
                const emailContent = `
                <h1>Your Account Email Updated</h1>
                <p>The email for your account has been updated.</p>
                <p><strong>New Email:</strong> ${data.email}</p>
                <p><a href="${url}/login">Click here to login</a></p>
            `;

                // Send email to the supervisor with the new email
                await sendEmail(
                      data.email,
                      "Your Account Email Updated",
                      emailContent
                );
            }
        }

        return {status: 200, data: newUser, message: "account updated successfully"};
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function createNewPasswordForAdmin(id, data) {
    try {
        const hashedPassword = await bcrypt.hash(data.password, 10);

        const newUser = await prisma.user.update({
            where: {id: +id},
            data: {
                password: hashedPassword
            },
        });
        return {status: 200, data: newUser, message: "password updated successfully"};

    } catch (error) {
        return handlePrismaError(error);

    }
}