export function  handlePrismaError(error) {
    console.error("Prisma error: ", error);

    switch (error.code) {
        case 'P2002':
            return { status: 409, message: `Unique constraint failed on the field: ${error.meta.target}` };

        case 'P2003':
            return { status: 400, message: `Foreign key constraint failed on the field: ${error.meta.field_name}` };

        case 'P2004':
            return { status: 400, message: `A constraint failed on the database: ${error.meta.constraint}` };

        case 'P2025':
            return { status: 404, message: `Record not found: ${error.meta.cause}` };

        case 'P2016':
            return { status: 400, message: `Query interpretation error: ${error.meta.details}` };

        case 'P2000':
            return { status: 400, message: `Value out of range for the column: ${error.meta.column}` };

        case 'P2017':
            return { status: 400, message: `Relation violation: ${error.meta.relation_name}` };

        case 'P2014':
            return { status: 400, message: `The change you are trying to make would violate the required relation: ${error.meta.relation_name}` };

        case 'P2026':
            return { status: 500, message: `Database timeout error: ${error.meta.details}` };

        default:
            return { status: 500, message: `An unexpected error occurred: ${error.message}` };
    }
}
