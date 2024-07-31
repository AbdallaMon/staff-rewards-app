import {NextResponse} from "next/server";
import fs from 'fs';
import {pipeline} from 'stream';
import {promisify} from 'util';
import {v4 as uuidv4} from 'uuid';
import {error} from "next/dist/build/output/log";

const pump = promisify(pipeline);

export const dynamic = 'force-dynamic'; // Ensures that the route is dynamic
export const api = {
    bodyParser: false, // Disable Next.js's default body parser
};

async function parseFormData(req) {
    try {
        const formData = await req.formData();
        const results = {}
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                const uniqueName = uuidv4() + '-' + value.name;  // Generating a unique name
                const filePath = `./public/${uniqueName}`;

                await pump(value.stream(), fs.createWriteStream(filePath));
                results[key] = filePath;
            } else {
                results[key] = value
            }
        }

        return results;
    } catch (e) {
        console.error(e);
        throw new error(e)
    }
}

export default parseFormData;
