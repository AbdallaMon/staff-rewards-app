import prisma from "@/lib/pirsma/prisma";
import bcrypt from "bcrypt";
import {sendEmail} from "@/app/api/utlis/sendMail";
import {url} from "@/app/constants";
import {handlePrismaError} from "@/app/api/utlis/prismaError";
import jwt from "jsonwebtoken";
import {generateResetToken} from "@/app/api/utlis/utility";
import dayjs from "dayjs";
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
                siteSupervisor: data.siteSupervisor,
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

export async function fetchEmployees(page = 1, limit = 10, employRequests = false, rejected = false, centerId, uncompleted, dutyId, userId, pending) {
    const offset = (page - 1) * limit;
    let requestStatus = employRequests ? "PENDING" : "APPROVED";
    if (rejected) {
        requestStatus = "REJECTED";
    }
    if (uncompleted) {
        requestStatus = "UNCOMPLETED";
    }
    if (pending) {
        requestStatus = "PENDING"
    }
    const where = {
        role: 'EMPLOYEE',
        accountStatus: requestStatus,
        centerId: centerId ? parseInt(centerId, 10) : undefined,
    };
    if (!uncompleted && !pending) {
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
                    additionalDuties: {
                        select: {
                            duty: {
                                select: {
                                    name: true,
                                    id: true,
                                }
                            },
                            userId: true,
                            dutyId: true,
                        }
                    },
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

export async function requestNewSignature(employId) {
    try {
        const user = await prisma.user.update({
            where: {id: parseInt(employId, 10)},
            data: {
                signature: null
            },
            select: {
                email: true
            }
        })

        const emailHtml = `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
        <h2 style="color: #7c5e24;">Request to Create a New Signature</h2>
        <p>Dear User,</p>
        <p>This is a request for you to create a new signature in our system. Your previous signature has been removed, and we kindly ask you to update your signature by visiting your profile.</p>
        <p>You can create your new signature by clicking the button below:</p>
        <div style="text-align: center; margin: 20px 0;">
            <a href="${url}/dashboard/profile" style="display: inline-block; padding: 10px 20px; background-color: #7c5e24; color: #ffffff; text-decoration: none; border-radius: 5px;">Create New Signature</a>
        </div>
        <p>Best regards</p>
    </div>
`;


        await sendEmail(
              user.email,
              "Action Required: Update Your Signature",
              emailHtml
        );

        return {status: 200, message: 'we removed old signature and send email to the user to edit it'};
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


export async function addUserDuties(userId, dutyIds) {
    try {
        // Create records in the join table for each duty
        const duties = dutyIds.map(dutyId => ({
            userId,
            dutyId,
        }));

        await prisma.userAdditionalDuties.createMany({
            data: duties,
            skipDuplicates: true,
        });

        return {status: 200, data: duties, message: "Duties assigned successfully."};
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function removeUserDuty(userId, dutyId) {
    try {
        const duty = await prisma.userAdditionalDuties.delete({
            where: {
                userId_dutyId: {
                    userId,
                    dutyId,
                },
            },
        });

        return {status: 200, data: duty, message: "Duty removed successfully."};
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

export async function getAssignments(page, limit) {
    const offset = (+page - 1) * +limit;
    try {
        const assignments = await prisma.assignment.findMany({
            skip: offset,
            take: limit,
            select: {
                id: true,
                title: true,
                _count: {
                    select: {
                        questions: {
                            where: {
                                isArchived: false, // Count non-archived questions
                            }
                        }
                    }
                }
            }
        });

        for (let assignment of assignments) {
            const dutyCount = await prisma.dutyAssignments.count({
                where: {
                    assignmentId: assignment.id,
                },
            });
            assignment._count.duties = dutyCount; // Add the duty count manually
        }

        const total = await prisma.assignment.count();

        return {
            status: 200,
            data: assignments,
            total
        }
    } catch (error) {
        return handlePrismaError(error)
    }
}

export async function getAssignmentById(assignmentId) {
    try {
        const assignment = await prisma.assignment.findUnique({
            where: {id: parseInt(assignmentId)},
            include: {
                questions: {
                    include: {
                        choices: true
                    }
                }
            }
        });
        return {data: assignment, status: 200}

    } catch (error) {
        return handlePrismaError()
    }
}

export async function createNewAssignment(data) {
    const {title, questions} = data

    try {
        const assignment = await prisma.assignment.create({
            data: {
                title,
                questions: {
                    create: questions.map((q) => ({
                        title: q.title,
                        totalPoints: q.totalPoints,
                        choices: {
                            create: q.choices.map((choice) => ({
                                text: choice.text,
                                points: choice.points
                            }))
                        }
                    }))
                }
            }
        });
        return {message: "Assigment created successfully", status: 200, data: assignment}
    } catch (e) {
        return handlePrismaError(e)
    }
}

export async function editAssignment(id, data) {
    const {questions} = data
    console.log(questions[0].choices, "choices")
    try {
        for (const question of questions) {
            await prisma.question.upsert({
                where: {id: question.id || 0}, // If no ID, create a new question
                update: {
                    title: question.title,
                    totalPoints: question.totalPoints,
                    isArchived: question.isArchived || false,
                    choices: {
                        upsert: question.choices.map((choice) => ({
                            where: {id: choice.id || 0},
                            update: {
                                text: choice.text,
                                points: choice.points,
                                isArchived: choice.isArchived || false,
                            },
                            create: {
                                text: choice.text,
                                points: choice.points
                            }
                        }))
                    }
                },
                create: {
                    title: question.title,
                    totalPoints: question.totalPoints,
                    assignmentId: id, // Link to the assignment
                    choices: {
                        create: question.choices.map((choice) => ({
                            text: choice.text,
                            points: choice.points
                        }))
                    }
                }
            });
        }
        return {
            status: 200,
            message: 'Assignment updated successfully'
        }
    } catch (e) {
        return handlePrismaError(e)
    }
}

export async function getAssignmentDuties(id) {
    try {
        const dutyAssignments = await prisma.dutyAssignments.findMany({
            where: {assignmentId: parseInt(id)},
            include: {
                duty: true, // This will fetch the details of the related duty
            }
        });

        const duties = dutyAssignments.map(da => da.duty); // Extract duties

        return {status: 200, data: duties};
    } catch (error) {
        return handlePrismaError(error);
    }
}


export async function assignAssignmentToADuty(assignmentId, dutyId) {
    try {
        const existingDutyAssignment = await prisma.dutyAssignments.findFirst({
            where: {
                dutyId: parseInt(dutyId),
            },
        });

        if (existingDutyAssignment) {
            return {
                status: 400,
                message: `This duty is already assigned to another assignment.`
            };
        }

        await prisma.dutyAssignments.create({
            data: {
                dutyId: parseInt(dutyId),
                assignmentId: parseInt(assignmentId),
            },
        });

        return {status: 200, message: 'Duty assigned successfully'};
    } catch (error) {
        console.log(error, "error");
        return handlePrismaError(error);
    }
}


export async function removeDutyFromAnAssigment(assignmentId, dutyId) {

    try {
        await prisma.dutyAssignments.deleteMany({
            where: {
                assignmentId: parseInt(assignmentId),
                dutyId: parseInt(dutyId),
            },
        });

        return {status: 200, message: 'Duty unassigned successfully'}
    } catch (error) {
        return handlePrismaError(error)
    }
}


export async function getUserRatingReport(data) {
    const {date, centerId, examType} = data;

    try {
        if (date === "null") {
            throw new Error("You have to select a date");
        }
        console.log(date, "date")
        const where = {
            date: {
                gte: dayjs(date).startOf('day').toDate(),  // Start of the selected day in local time
                lte: dayjs(date).endOf('day').toDate()  // End of the selected day in local time
            }
        };


        if (centerId) where.centerId = +centerId;
        if (examType) where.examType = examType;

        const dayAttendances = await prisma.dayAttendance.findMany({
            where,
            include: {
                user: {
                    select: {name: true, totalRating: true}
                },
                center: {
                    select: {
                        name: true
                    }
                },
                userAssignment: {
                    select: {totalRating: true}
                },
                attendances: {
                    select: {
                        dutyRewards: {
                            select: {
                                duty: {
                                    select: {name: true}
                                }
                            }
                        }
                    }
                }
            }
        });

        // Map the result to extract one duty per attendance
        const formattedResults = dayAttendances.map(dayAttendance => ({
            user: dayAttendance.user,
            userAssignment: dayAttendance.userAssignment,
            duty: dayAttendance.attendances[0]?.dutyRewards[0]?.duty?.name || "N/A", // Extract the first duty from the attendance
            examType: dayAttendance.examType
            , center: dayAttendance.center.name,
            date: dayAttendance.date
        }));

        return {status: 200, data: formattedResults};
    } catch (e) {
        return handlePrismaError(e);
    }
}

export async function getUserAssignmentReport(data) {
    const {date, centerId, examType} = data;

    try {
        if (date === "null") {
            throw new Error("You have to select a date");
        }


        const where = {
            date: {
                gte: dayjs(date).startOf('day').toDate(),  // Start of the selected day in local time
                lte: dayjs(date).endOf('day').toDate()  // End of the selected day in local time
            },
            userAssignment: {
                isNot: null, // This ensures only records with userAssignment are returned
            },
        };


        if (centerId) where.centerId = +centerId;
        if (examType) where.examType = examType;

        // Fetch DayAttendances with related user assignment, questions, choices, etc.
        const dayAttendances = await prisma.dayAttendance.findMany({
            where,
            include: {
                user: {
                    select: {
                        name: true,
                        totalRating: true
                    }
                },
                userAssignment: {
                    select: {
                        totalRating: true,
                        totalScore: true,
                        totalPoints: true,
                        questionAnswers: {
                            include: {
                                question: {
                                    select: {
                                        title: true,
                                        totalPoints: true,
                                    }
                                },
                                choice: {
                                    select: {
                                        text: true,
                                        points: true,
                                    }
                                },
                            },
                        },
                    },
                },
                center: {
                    select: {name: true}
                },
                attendances: {
                    include: {
                        dutyRewards: {
                            select: {
                                duty: {
                                    select: {name: true}
                                }
                            }
                        }
                    }
                }
            },
        });

        // Format the data to only include relevant information for the report
        const reportData = dayAttendances.map((dayAttendance) => {
            const dutyName = dayAttendance.attendances.length > 0
                  ? dayAttendance.attendances[0].dutyRewards[0].duty.name
                  : "N/A";

            return {
                date: dayAttendance.date,
                examType: dayAttendance.examType || "N/A",
                user: dayAttendance.user,
                center: dayAttendance.center?.name || "N/A",
                duty: dutyName,
                userAssignment: dayAttendance.userAssignment
                      ? {
                          totalRating: dayAttendance.userAssignment.totalRating,
                          totalScore: dayAttendance.userAssignment.totalScore,
                          totalPoints: dayAttendance.userAssignment.totalPoints,
                          questionAnswers: dayAttendance.userAssignment.questionAnswers.map((qa) => ({
                              questionTitle: qa.question.title,
                              questionPoints: qa.question.totalPoints,
                              choiceText: qa.choice.text,
                              comment: qa.comment || "N/A",
                          })),
                      }
                      : null,
            };
        });

        return {status: 200, data: reportData};

    } catch (error) {
        return {status: 500, message: error.message || "Error generating user assignment report"};
    }
}


// pages control
export async function getPageControl(page) {
    try {
        const pageStatus = await prisma.pageAvailability.findUnique({
            where: {page},
        });
        return {status: 200, data: pageStatus};
    } catch (error) {
        return {status: 500, message: error.message};
    }
}

// Update page control data
export async function updatePageControl(page, data) {
    try {
        const pageStatus = await prisma.pageControl.update({
            where: {page},
            data: {
                status: data.status || undefined,
            },
        });
        return {status: 200, data: pageStatus, message: "Page status changed successfully"};
    } catch (error) {
        console.log(error, "error")
        return {status: 500, message: error.message};
    }
}