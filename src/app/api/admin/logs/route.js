import {PrismaClient} from '@prisma/client';
import dayjs from 'dayjs';

const prisma = new PrismaClient();

export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const date = searchParams.get("date");

    const filters = {};
    if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        filters.createdAt = {
            gte: startOfDay,
            lte: endOfDay,
        };
    } else if (startDate && endDate) {
        filters.createdAt = {
            gte: new Date(startDate),
            lte: new Date(endDate),
        };
    } else if (startDate) {
        filters.createdAt = {
            gte: new Date(startDate),
            lte: dayjs(startDate).add(1, 'month').toDate(),
        };
    } else if (endDate) {
        filters.createdAt = {
            gte: dayjs(endDate).subtract(1, 'month').toDate(),
            lte: new Date(endDate),
        };
    }

    try {
        const logs = await prisma.log.findMany({
            where: filters,
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
                createdAt: 'desc',
            },
        });

        return new Response(JSON.stringify(logs), {status: 200});
    } catch (error) {
        console.error('Error fetching logs:', error);
        return new Response(JSON.stringify({message: 'Internal server error'}), {status: 500});
    }
}
