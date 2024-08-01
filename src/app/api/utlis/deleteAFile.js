import fs from 'fs';
import path from 'path';
import {NextResponse} from 'next/server';

export const dynamic = 'force-dynamic'; // Ensures that the route is dynamic
export const api = {
    bodyParser: false, // Disable Next.js's default body parser
};

/**
 * Deletes a file from the public directory based on the provided URL.
 * @param {string} fileUrl - The URL of the file to be deleted.
 */
export async function deleteFileFromUrl(fileUrl) {
    try {
        // Extract the file name from the URL
        // Construct the file path
        const filePath = path.join(process.cwd(), '', fileUrl);

        // Check if the file exists
        if (fs.existsSync(filePath)) {
            // Delete the file
            fs.unlinkSync(filePath);
            console.log(`File deleted: ${filePath}`);
            return NextResponse.json({message: 'File deleted successfully'});
        } else {
            console.log('File not found:', filePath);
            return NextResponse.json({message: 'File not found'}, {status: 404});
        }
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json({message: 'Error deleting file'}, {status: 500});
    }
}