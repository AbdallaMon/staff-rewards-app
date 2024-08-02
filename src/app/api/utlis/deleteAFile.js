import axios from 'axios';
import {NextResponse} from 'next/server';

export const dynamic = 'force-dynamic'; // Ensures that the route is dynamic
export const api = {
    bodyParser: false, // Disable Next.js's default body parser
};

/**
 * Deletes a file from Nextcloud based on the provided URL.
 * @param {string} fileUrl - The URL of the file to be deleted.
 */
export async function deleteFileFromUrl(fileUrl) {
    try {
        const nextcloudUrlBase = process.env.NEXTCLOUD_URL;
        const nextcloudUsername = process.env.NEXTCLOUD_USERNAME;
        const nextcloudPassword = process.env.NEXTCLOUD_PASSWORD;

        // Ensure the file URL is within the Nextcloud base URL
        if (!fileUrl.startsWith(nextcloudUrlBase)) {
            console.log('Invalid file URL:', fileUrl);
            return NextResponse.json({message: 'Invalid file URL'}, {status: 400});
        }

        // Make a DELETE request to the Nextcloud URL to delete the file
        await axios.delete(fileUrl, {
            auth: {
                username: nextcloudUsername,
                password: nextcloudPassword,
            },
        });

        console.log(`File deleted: ${fileUrl}`);
        return NextResponse.json({message: 'File deleted successfully'});
    } catch (error) {
        console.error('Error deleting file:', error);
        if (error.response && error.response.status === 404) {
            return NextResponse.json({message: 'File not found'}, {status: 404});
        }
        return NextResponse.json({message: 'Error deleting file'}, {status: 500});
    }
}

export default deleteFileFromUrl;
