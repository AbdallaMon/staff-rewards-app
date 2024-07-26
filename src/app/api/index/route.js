import prisma from "@/lib/pirsma/prisma";

const modelMap = {
    duty: prisma.duty,
    center: prisma.center,
    // Add other models as needed
};

export async function getIndexedData(index, filters) {
    const model = modelMap[index];

    if (!model) {
        throw new Error(`Model '${index}' not found`);
    }

    const where = filters ? filters : {};

    try {
        const data = await model.findMany({
            where,
            select: {
                id: true,
                name: true,
            },
        });
        console.log(data, "data");
        return { data,status: 200 };
    } catch (error) {
        console.error(`Error fetching data from ${index}:`, error);
        throw error;
    }
}

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const index = searchParams.get('id');
    const filters = JSON.parse(searchParams.get('filters') || '{}');

    try {
        const result = await getIndexedData(index, filters);
        console.log(result,"resul")
        return Response.json(result, { status: 200 });
    } catch (error) {
        return Response.json({
            message: `Failed to fetch data: ${error.message}`,
        }, { status: 500 });
    }
}