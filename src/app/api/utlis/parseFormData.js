import {v4 as uuidv4} from 'uuid';
import axios from 'axios';
import {Buffer} from 'buffer';

export const config = {
    api: {
        bodyParser: false, // Disable Next.js's default body parser
    },
};

async function parseFormData(req) {
    const formData = await req.formData();
    try {
        const results = {};
        const deletedUrl = formData.get('deletedUrl');
        const nextcloudUrlBase = process.env.NEXTCLOUD_URL;
        const nextcloudUsername = process.env.NEXTCLOUD_USERNAME;
        const nextcloudPassword = process.env.NEXTCLOUD_PASSWORD;
        for (const [key, value] of formData.entries()) {
            if (value instanceof File) {
                if (key === 'deletedUrl') continue;

                const uniqueName = uuidv4() + '-' + value.name;
                const nextcloudUrl = `${nextcloudUrlBase}/${uniqueName}`;

                // Convert the arrayBuffer to a Buffer
                const buffer = Buffer.from(await value.arrayBuffer());

                // Upload the file to Nextcloud using Axios
                await axios.put(nextcloudUrl, buffer, {
                    auth: {
                        username: nextcloudUsername,
                        password: nextcloudPassword,
                    },
                    headers: {
                        'Content-Type': value.type,
                    },
                });

                results[key] = nextcloudUrl;
            } else {
                if (key === 'deletedUrl') continue;
                results[key] = value;
            }
        }

        if (deletedUrl) {
            return {uploadedUrls: results, deletedUrl};
        }
        return results;
    } catch (e) {
        console.error(e);
        throw new Error('File upload error');
    }
}

export default parseFormData;
