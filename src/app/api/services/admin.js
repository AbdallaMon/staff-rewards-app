import prisma from "@/lib/pirsma/prisma";
import bcrypt from "bcrypt";
import { sendEmail } from "@/app/api/utlis/sendMail";
import { url } from "@/app/constants";

// Helper function to handle Prisma errors
function handlePrismaError(error) {
    if (error.code === 'P2002') {
        const target = error.meta.target;
        return { status: 409, message: `Unique constraint failed on the field: ${target}` };
    }
    return { status: 500, message: `Database error: ${error.message}` };
}

////// Shifts //////
export async function fetchShifts(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    try {
        const [shifts, total] = await prisma.$transaction([
            prisma.shift.findMany({
                skip: offset,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.shift.count(),
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
        return { status: 200, data: newShift, message: "Shift created successfully" };
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function editShift(id, data) {
    try {
        const updatedShift = await prisma.shift.update({
            where: { id: parseInt(id, 10) },
            data: {
                name: data.name,
                duration: +data.duration,
            },
        });
        return { status: 200, data: updatedShift, message: "Shift updated successfully" };
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function deleteShift(id) {
    try {
        const deletedShift = await prisma.shift.delete({
            where: { id: parseInt(id, 10) },
        });
        return { status: 200, data: deletedShift, message: "Shift deleted successfully" };
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
                orderBy: { createdAt: 'desc' },
            }),
            prisma.duty.count(),
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
        return { status: 200, data: newDuty, message: "Duty created successfully" };
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function editDuty(id, data) {
    try {
        const updatedDuty = await prisma.duty.update({
            where: { id: parseInt(id, 10) },
            data: {
                name: data.name,
                amount: +data.amount,
            },
        });
        return { status: 200, data: updatedDuty, message: "Duty updated successfully" };
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function deleteDuty(id) {
    try {
        const deletedDuty = await prisma.duty.delete({
            where: { id: parseInt(id, 10) },
        });
        return { status: 200, data: deletedDuty, message: "Duty deleted successfully" };
    } catch (error) {
        return handlePrismaError(error);
    }
}

// Center

export async function createCenter(data) {
    const actualPassword = data.password;
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
                    connect: { id: newUser.id }
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

        return { status: 200, data: newCenter, message: "Center created successfully and email sent to supervisor." };
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function editCenter(id, data) {
    try {
        if (data.email) {
            const existingCenter = await prisma.center.findUnique({
                where: { id: parseInt(id, 10) },
            });

            if (!existingCenter) {
                return { status: 404, message: "Center not found" };
            }
        }

        // Update the center
        const updatedCenter = await prisma.center.update({
            where: { id: parseInt(id, 10) },
            data: {
                ...data
            },
        });

        if (data.email) {
            await prisma.user.update({
                where: { id: updatedCenter.adminUserId },
                data: { email: data.email },
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

        return { status: 200, data: updatedCenter, message: "Center updated successfully" };
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
                orderBy: { createdAt: 'desc' },
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

        // Delete the user (center admin)

        // Delete the center
        const deletedCenter = await prisma.center.delete({
            where: { id: parseInt(id, 10) },
        });
        const deletedUser = await prisma.user.delete({
            where: { id: deletedCenter.adminUserId },
        });

        return { status: 200, data: deletedCenter, message: "Center and associated admin user deleted successfully" };
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function fetchEmployees(page = 1, limit = 10,employRequests=false,rejected=false) {
    const offset = (page - 1) * limit;
    let requestStatus = employRequests ? "PENDING" : "APPROVED";
    if(rejected){
        requestStatus="REJECTED";
    }
    try {
        const [employees, total] = await prisma.$transaction([
            prisma.user.findMany({
                where: { role: 'EMPLOYEE', accountStatus: requestStatus },
                skip: offset,
                take: limit,
                select: {
                    rejectedReason: requestStatus === "REJECTED",
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
                    attendance: {
                        select: {
                            shift: {
                                select: {
                                    rewards: {
                                        select: {
                                            amount: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where: { role: 'EMPLOYEE', accountStatus: requestStatus} })
        ]);

        const employeesWithRewards = employees.map(employee => {
            const totalRewards = employee.attendance?.reduce((acc, attendance) => {
                return acc + attendance.shift.rewards.reduce((shiftAcc, reward) => {
                    return shiftAcc + reward.amount;
                }, 0);
            }, 0) || 0;

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
export async function fetchUnconfirmedUsers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    try {
        const [users, total] = await prisma.$transaction([
            prisma.user.findMany({
                where: { emailConfirmed: false },
                skip: offset,
                take: limit,
                include: {
                    center: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where: { emailConfirmed: false } })
        ]);
        return {
            status: 200,
            data: users,
            total,
            page,
            limit,
            message: "Unconfirmed users fetched successfully",
        };
    } catch (error) {
        return handlePrismaError(error);

    }
}


export async function EditEmploy(employId,data){
    if(data.centerId){
        data.centerId=parseInt(data.centerId,10);
    }
    if(data.dutyId){
        data.dutyId=parseInt(data.dutyId,10);
    }
    try {
        const updatedEmploy = await prisma.user.update({
            where: { id: parseInt(employId, 10) },
            data: {
                ...data
            },
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
                attendance: {
                    select: {
                        shift: {
                            select: {
                                rewards: {
                                    select: {
                                        amount: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },

        });
        const totalRewards = updatedEmploy.attendance?.reduce((acc, attendance) => {
            return acc + attendance.shift.rewards.reduce((shiftAcc, reward) => {
                return shiftAcc + reward.amount;
            }, 0);
        }
            , 0) || 0;
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
            where: { id: parseInt(id, 10) },
            include: {
                center: true,
                duty: true,
                attendance: {
                    include: {
                        shift: true,
                        center: true
                    }
                }
            }
        });

        if (!user) {
            return { status: 404, message: "User not found" };
        }

        return { status: 200, data: user, message: "User fetched successfully" };
    } catch (error) {
        return handlePrismaError(error);
    }
}

///// employes requests /////

export const approveUser = async (userId, { password, examType }) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                examType,
                accountStatus: 'APPROVED',
            },
        });

        const emailContent = `
      <h1>Account Approved</h1>
      <p>Your account has been approved. You can log in with your email and the password provided.</p>
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Password:</strong> ${password}</p>
      <p><a href="${url}/login">Click here to login</a></p>
    `;

        await sendEmail(user.email, 'Account Approved', emailContent);

        return { status: 200, message: 'User approved successfully and a message sent to the user email ' };
    } catch (error) {
        console.error('Error approving user:', error);
        return handlePrismaError(error);
    }
};

export const rejectUser = async (userId, { reason }) => {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { accountStatus: 'REJECTED', rejectedReason: reason },
        });

        const emailContent = `
      <h1>Account Rejected</h1>
      <p>Your account has been rejected for the following reason:</p>
      <p>${reason}</p>
    `;

        await sendEmail(user.email, 'Account Rejected', emailContent);

        return { status: 200, message: 'User rejected and a message with the reason sent to his email' };
    } catch (error) {
        console.error('Error rejecting user:', error);
        return handlePrismaError(error);
    }
};
export const uncompletedUser = async (userId, { checks, comments }) => {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: { accountStatus: 'UNCOMPLETED' },
        });

        let emailContent = '<h1>Account Registration Incomplete</h1><p>Your account registration is incomplete for the following reasons:</p><ul>';
        checks.forEach((field) => {
            emailContent += `<li><strong>${field}:</strong> ${comments[field] || 'No comment provided'}</li>`;
        });
        emailContent += `</ul><p><a href="${url}/signup/${userId}">Click here to complete your registration</a></p>`;

        await sendEmail(user.email, 'Account Registration Incomplete', emailContent);

        return { status: 200, message: 'User marked as uncompleted and a message with uncompleted details sent with link' };
    } catch (error) {
        console.error('Error marking user as uncompleted:', error);
        return handlePrismaError(error);
    }
};