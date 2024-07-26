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

        // Send email to the supervisor with the password
        await sendEmail(
              data.supervisorEmail,
              "Your Center Account Details",
              `Your account has been created successfully.\n\nEmail: ${data.email}\nPassword: ${actualPassword} \n\nYou can login at ${url}/login`
        );

        return { status: 200, data: newCenter, message: "Center created successfully and email sent to supervisor." };
    } catch (error) {
        return handlePrismaError(error);
    }
}

export async function editCenter(id, data) {
    try {
        console.log(data);
    if(data.email){
        const existingCenter = await prisma.center.findUnique({
            where: { id: parseInt(id, 10) },
        });
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
            // Send email to the supervisor with the new email
            await sendEmail(
                  updatedCenter.supervisorEmail,
                  "Your Center Account Email Updated",
                  `The email for your center account has been updated.\n\nNew Email: ${data.email} \n\nYou can login at ${url}/login`
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

export async function fetchEmployees(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    try {
        const [employees, total] = await prisma.$transaction([
            prisma.user.findMany({
                where: { role: 'EMPLOYEE', emailConfirmed: true },
                skip: offset,
                take: limit,
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
                orderBy: { createdAt: 'desc' },
            }),
            prisma.user.count({ where: { role: 'EMPLOYEE', emailConfirmed: true } })
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

export async function confirmUserEmail(userId, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(userId, 10) },
            data: {
                password: hashedPassword,
                emailConfirmed: true
            }
        });

        await sendEmail(
              updatedUser.email,
              "Your Account Details",
              `Your account has been confirmed.\n\nEmail: ${updatedUser.email}\nPassword: ${password}\n\nYou can login at ${url}/login`
        );

        return { status: 200, data: updatedUser, message: "User email confirmed and password sent successfully" };
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