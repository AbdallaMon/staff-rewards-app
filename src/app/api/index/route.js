import prisma from "@/lib/pirsma/prisma";
import {cookies} from "next/headers";
import jwt from "jsonwebtoken";

const modelMap = {
    duty: prisma.duty,
    center: prisma.center,
    shift: prisma.shift,
    user: prisma.user,
    // Add other models as needed
};

export async function getIndexedData(index, query, filters, centerId) {
    const model = modelMap[index];

    if (!model) {
        throw new Error(`Model '${index}' not found`);
    }

    const where = filters ? filters : {};
    if (index === "duty" || index === "shift") {
        where.archived = false;
    }

    if (index === "user") {
        if (query) {
            where.emiratesId = {contains: query};
            where.accountStatus = "APPROVED";
        }
        if (centerId) {
            where.centerId = centerId;
        }
    }
    const select = {
        id: true, name: true
    }
    if (index === "user") {
        select.emiratesId = true
        select.email = true
        select.duty = true
    }
    if (index === "shift") {
        select.duration = true
    }
    if (index === "duty") {
        select.amount = true
    }
    try {
        const data = await model.findMany({
            where,
            select: select,
        });
        return {data, status: 200};
    } catch (error) {
        console.error(`Error fetching data from ${index}:`, error);
        throw error;
    }
}

export async function GET(request) {
    const {searchParams} = new URL(request.url);
    const index = searchParams.get('id');
    const query = searchParams.get('query') || '';
    const filters = JSON.parse(searchParams.get('filters') || '{}');
    const centerIdFlag = searchParams.get('centerId') === 'true';

    let centerId = null;

    if (centerIdFlag) {
        const SECRET_KEY = process.env.SECRET_KEY;
        const cookieStore = cookies();
        const token = cookieStore.get("token")?.value;

        if (token) {
            try {
                const decoded = jwt.verify(token, SECRET_KEY);
                centerId = decoded.centerId;
            } catch (error) {
                console.error("Error decoding token:", error);
                return Response.json({
                    message: "Failed to decode token",
                    error: error.message,
                }, {status: 500});
            }
        } else {
            return Response.json({
                message: "No token provided",
                error: "Unauthorized",
            }, {status: 401});
        }
    }

    try {
        const result = await getIndexedData(index, query, filters, centerId);
        return Response.json(result, {status: 200});
    } catch (error) {
        return Response.json({
            message: `Failed to fetch data: ${error.message}`,
        }, {status: 500});
    }
}
