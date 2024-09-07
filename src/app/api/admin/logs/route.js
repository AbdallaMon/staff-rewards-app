import dayjs from 'dayjs';
import prisma from "@/lib/pirsma/prisma";


export async function GET(request) {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const date = searchParams.get("date");

    const filters = {};
    if (date && date !== "null") {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        filters.createdAt = {
            gte: startOfDay,
            lte: endOfDay,
        };
    } else if (startDate && endDate && startDate !== "null" && endDate !== "null") {
        filters.createdAt = {
            gte: dayjs(startDate).startOf('day').toDate(),
            lte: dayjs(endDate).endOf('day').toDate(),
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
