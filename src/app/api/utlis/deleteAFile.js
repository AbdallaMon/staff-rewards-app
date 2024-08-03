import axios from 'axios';
import {NextResponse} from 'next/server';

export const dynamic = 'force-dynamic'; // Ensures that the route is dynamic
export const api = {
    bodyParser: false, // Disable Next.js's default body parser
};

/**
 * Deletes a file from Nextcloud based on the provided file path.
 * @param {string} filePath - The path of the file to be deleted.
 */
export async function deleteFileFromPath(filePath) {
    try {
        const nextcloudUrlBase = process.env.NEXTCLOUD_URL;
        const nextcloudUsername = process.env.NEXTCLOUD_USERNAME;
        const nextcloudPassword = process.env.NEXTCLOUD_PASSWORD;
        const parsedUrl = new URL(filePath);
        const name = parsedUrl.searchParams.get('name');
        // Construct the WebDAV path for deletion
        const deleteUrl = `${nextcloudUrlBase}/${name}`;
        console.log('Constructed Delete URL:', filePath);

        // Make a DELETE request to the Nextcloud URL to delete the file
        const response = await axios.delete(deleteUrl, {
            auth: {
                username: nextcloudUsername,
                password: nextcloudPassword,
            },
        });

        console.log('Delete response:', response.data);

        return NextResponse.json({message: 'File deleted successfully'});
    } catch (error) {
        console.error('Error deleting file:', error);

        if (error.response) {
            console.error('Error response data:', error.response.data);
            if (error.response.status === 404) {
                return NextResponse.json({message: 'File not found'}, {status: 404});
            }
        }

        return NextResponse.json({message: 'Error deleting file'}, {status: 500});
    }
}

export default deleteFileFromPath;
