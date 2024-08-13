import axios from 'axios';
import {Buffer} from 'buffer';
import archiver from 'archiver';

export async function POST(request) {
    try {
        const {files} = await request.json(); // Parse the JSON body

        if (!files || files.length === 0) {
            return new Response(JSON.stringify({error: 'Files are required'}), {status: 400});
        }

        // Create the ZIP archive
        const archive = archiver('zip', {zlib: {level: 9}}); // Set the compression level

        // Start streaming the archive
        const headers = new Headers({
            'Content-Disposition': 'attachment; filename="attachments.zip"',
            'Content-Type': 'application/zip',
        });

        const responseStream = new ReadableStream({
            start(controller) {
                archive.on('data', chunk => controller.enqueue(chunk));
                archive.on('end', () => controller.close());
                archive.on('error', err => controller.error(err));
            }
        });

        // Process each file URL and append to the archive with the correct filename
        for (const file of files) {
            const authHeader = 'Basic ' + Buffer.from(`${process.env.NEXTCLOUD_USERNAME}:${process.env.NEXTCLOUD_PASSWORD}`).toString('base64');
            const response = await axios.get(file.url, {
                responseType: 'stream',
                headers: {
                    'Authorization': authHeader,
                },
            });

            // Append the file to the archive with the given filename
            archive.append(response.data, {name: file.filename});
        }

        // Finalize the archive after appending all files
        archive.finalize();

        return new Response(responseStream, {headers, status: 200});

    } catch (error) {
        console.error('Failed to create ZIP file:', error.message);
        return new Response(JSON.stringify({error: 'Failed to create ZIP file'}), {status: 500});
    }
}
