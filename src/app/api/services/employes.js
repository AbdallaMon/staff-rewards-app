import prisma from "@/lib/pirsma/prisma";
import {url} from "@/app/constants";
import {sendEmail} from "@/app/api/utlis/sendMail";
import {createToken} from "@/app/api/utlis/tokens";
import {Prisma} from "@prisma/client";
import {handlePrismaError} from "@/app/api/utlis/prismaError";
import bcrypt from "bcrypt";
import {Buffer} from "buffer";
import jwt from "jsonwebtoken";
import {getPageControl} from "@/app/api/services/admin";

export async function createEmployeeRequest(data) {
    try {
        data.dutyId = +data.dutyId;
        data.centerId = +data.centerId;
        data.emailConfirmed = false;
        data.accountStatus = "PENDING"
        data.role = "EMPLOYEE"
        const page = await getPageControl('REGISTER');
        let isOpen = page.data.status === "OPEN";
        if (!isOpen) {
            return {message: "Registration is currently closed.", status: 400}
        }
        if (data.password) {
            const hashedPassword = bcrypt.hashSync(data.password, 8);
            delete data.confirmPassword;
            data.password = hashedPassword
        }

        if (data.ibanBank) {
            data.ibanBank = "AE" + data.ibanBank;
        }
        const user = await prisma.user.create(
              {data}
        )
        const payloadData = {
            userId: user.id,
            email: user.email,
        }
        const payload = createToken(payloadData)
        const emailContent = `
            <h1>Confirm your account</h1>
            <p>Your account has been created. To complete your registration, please confirm your email address by clicking the link below:</p>
            <p><a href="${url}/confirm?token=${payload}">Confirm your email</a></p>
        `;
        await sendEmail(user.email, 'Confirm your account', emailContent);

        return {
            status: 200,
            message: 'A confirmation link has been sent to your email account to complete your registration. Please review your email, and make sure to check your junk or spam folder if you do not see it in your inbox.'
        };
    } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {

            if (e.code === 'P2002' && e.meta && e.meta.target.includes('User_email_key')) {
                return {message: "A user with this email already exists.", status: 400}
            }
        }
        return handlePrismaError(e)
    }
}

export async function completeRegisterAndConfirmUser(data, userId) {
    try {
        data.emailConfirmed = true;
        data.accountStatus = "PENDING"
        if (data.centerId) {
            data.centerId = +data.centerId;
        }
        if (data.ibanBank) {
            data.ibanBank = "AE" + data.ibanBank
        }
        if (data.dutyId) {
            data.dutyId = +data.dutyId;
        }

        await prisma.user.update(
              {
                  where: {id: userId},
                  data
              }
        )
        return {
            status: 200,
            message: 'Your attachments uploaded ,and your email confirmed we will review your request and send u message via email'
        };
    } catch (e) {

        return handlePrismaError(e)
    }
}

export async function checkIfEmailAlreadyConfirmed(userId, confirmed) {
    try {
        if (confirmed) {
            confirmed = true
        } else {
            confirmed = false
        }
        const where = {
            id: userId,
            emailConfirmed: confirmed,
        }
        if (confirmed) {
            where.accountStatus = "UNCOMPLETED"
        } else {
            where.accountStatus = 'PENDING'
        }

        const user = await prisma.user.findUnique({
            where: where
        })
        if (!user) {
            return {status: 400, message: "The link is expired and this account status has been sent to your email"}
        } else {
            return {status: 200}
        }
    } catch (e) {
        return handlePrismaError(e)

    }
}

export async function getEmployeeCommitmentDataById(employeeId) {

    try {
        const user = await prisma.user.findUnique({
            where: {id: parseInt(employeeId)},
            select: {
                name: true,
                emiratesId: true, phone: true, email: true
                , duty: {
                    select: {
                        name: true

                    }
                }
            }
        });
        return {data: user, status: 200}
    } catch (e) {
        return handlePrismaError(e)
    }
}

export async function getEmployeeById(employeeId) {
    try {

        const user = await prisma.user.findUnique({
            where: {id: parseInt(employeeId)},
            include: {
                duty: true,
                center: true
            }
        });
        if (user.signature) {
            const signatureResponse = await fetch(user.signature);
            if (signatureResponse.ok) {
                const buffer = await signatureResponse.arrayBuffer();
                const base64Signature = Buffer.from(buffer).toString('base64');
                user.signature = `data:image/png;base64,${base64Signature}`;
            } else {
                user.signature = null;
            }
        }
        return {data: user, status: 200}

    } catch (e) {
        return handlePrismaError(e)
    }
}

export async function updateEmployee(employeeId, data, userDecoded, cookieStore, SECRET_KEY) {
    try {
        if (data.ibanBank) {
            data.ibanBank = "AE" + data.ibanBank;
        }
        const selected = Object.keys(data)[0]
        const user = await prisma.user.update({
            where: {id: parseInt(employeeId)},
            data,
            select: {
                id: true,
                [selected]: true,
            },
        });
        if (userDecoded) {
            delete userDecoded.iat
            delete userDecoded.exp
        }
        if (data.signature) {
            const token = jwt.sign({
                ...userDecoded
                , signature: data.signature
            }, SECRET_KEY, {
                expiresIn: '4h',
            });
            cookieStore.set({
                name: "token",
                value: token,
                httpOnly: true,
                secure: true,
                path: "/",
            });
        }
        if (data.commitment) {
            const token = jwt.sign({
                ...userDecoded,
                commitment: data.commitment
            }, SECRET_KEY, {
                expiresIn: '4h',
            });
            cookieStore.set({
                name: "token",
                value: token,
                httpOnly: true,
                secure: true,
                path: "/",
            });
        }
        return {data: data, status: 200, message: "updated successfully", user}

    } catch (e) {
        return handlePrismaError(e)
    }
}


export async function getEmployeeAttendance(employeeId, filters, page, limit) {
    try {
        const where = {userId: parseInt(employeeId)};

        if (filters.date) {
            const date = new Date(filters.date);
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            where.date = {
                gte: startOfDay,
                lte: endOfDay,
            };
        }

        const skip = (page - 1) * limit;
        const take = limit;

        // Fetch the filtered attendances with pagination
        const dayAttendances = await prisma.dayAttendance.findMany({
            where: where,
            include: {
                attendances: {
                    include: {
                        shift: true,
                        dutyRewards: true,
                    },
                },
                userAssignment: {
                    select: {totalRating: true, id: true}
                }
            },
            skip,
            take,
            orderBy: {
                date: 'desc',
            },
        });


        const totalRecords = await prisma.dayAttendance.count({where});
        const totalPages = Math.ceil(totalRecords / limit);

        const allShifts = await prisma.shift.findMany({
            where: {archived: false,},
        });

        const enhancedDayAttendances = dayAttendances.map((dayAttendance) => {
            const attendedShiftIds = dayAttendance.attendances.map((att) => att.shiftId);
            const nonAttendedShifts = allShifts.filter((shift) => !attendedShiftIds.includes(shift.id));

            return {...dayAttendance, nonAttendedShifts};
        });

        return {
            data: enhancedDayAttendances,
            totalPages,
            currentPage: page,
            totalRecords,
            status: 200,
        };
    } catch (e) {
        console.log(e, "Error in getEmployeeAttendance");
        return handlePrismaError(e);
    }
}


export async function getUserDayAttendancesWithoutAttachment(userId) {
    try {
        const dayAttendances = await prisma.dayAttendance.findMany({
            where: {
                userId: parseInt(userId),
                OR: [
                    {attachment: null},
                    {attachment: ''},
                ],
            },
            include: {
                attendances: {
                    include: {
                        shift: true,
                        dutyRewards: {
                            include: {
                                duty: true
                            }
                        }
                    },
                },
                user: {
                    select: {
                        name: true,
                        emiratesId: true,
                        duty: true,
                        signature: true,
                    },
                },
                center: true,
            },
        });
        if (dayAttendances.length > 0 && dayAttendances[0].user.signature) {
            const signatureUrl = dayAttendances[0].user.signature;
            const signatureResponse = await fetch(signatureUrl);
            if (signatureResponse.ok) {
                const buffer = await signatureResponse.arrayBuffer();
                const base64Signature = Buffer.from(buffer).toString('base64');
                dayAttendances[0].user.signature = `data:image/png;base64,${base64Signature}`;
            } else {
                dayAttendances[0].user.signature = null;
            }
        }

        return {status: 200, data: dayAttendances.length > 0 ? dayAttendances : null};
    } catch (e) {
        return {status: 500, error: 'Failed to fetch day attendances'};
    }
}

export async function updateDayAttendanceAttachment(dayAttendanceId, data) {
    try {
        await prisma.dayAttendance.update(
              {
                  where: {id: parseInt(dayAttendanceId)},
                  data, select: {id: true},
              }
        )
        return {status: 200, message: "uploaded successfully", data}
    } catch (e) {
        console.log(e, "error in update day attendance")
        return handlePrismaError(e)
    }
}

