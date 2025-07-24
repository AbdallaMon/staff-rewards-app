import {v4 as uuidv4} from 'uuid';
import axios from 'axios';
import {Buffer} from 'buffer';

export const config = {
    api: {
        bodyParser: false, // Disable Next.js's default body parser
    },
};

async function parseFormData(req, withDelete) {
    const formData = await req.formData();
    try {
        const results = {};
        const deletedUrl = formData.get('deletedUrl');
        const nextcloudUrlBase = process.env.NEXTCLOUD_URL;
        const nextcloudUsername = process.env.NEXTCLOUD_USERNAME;
        const nextcloudPassword = process.env.NEXTCLOUD_PASSWORD;

        for (const [key, value] of formData.entries()) {
            if (value && typeof value.arrayBuffer === 'function' && value.name) {
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

                // Generate a public share link for the uploaded file
                const shareUrl = `${nextcloudUrlBase.replace('/remote.php/webdav', '')}/ocs/v2.php/apps/files_sharing/api/v1/shares`;
                const shareResponse = await axios.post(shareUrl, null, {
                    params: {
                        path: `/${uniqueName}`,
                        shareType: 3, // Public link
                        permissions: 1, // Read-only
                    },
                    auth: {
                        username: nextcloudUsername,
                        password: nextcloudPassword,
                    },
                    headers: {
                        'OCS-APIREQUEST': 'true',
                    },
                });
                const extenstion = value.type === "application/pdf" ? `?type=pdf&name=${uniqueName}` : `/preview?name=${uniqueName}`
                let publicUrl = shareResponse.data.ocs.data.url + extenstion;
                if (publicUrl.startsWith('http://')) {
                    publicUrl = publicUrl.replace('http://', 'https://');
                }
                results[key] = publicUrl;
            } else {
                if (key === 'deletedUrl') continue;
                results[key] = value;
            }
        }


        if (withDelete) {
            return {uploadedUrls: results, deletedUrl};
        }

        return results;
    } catch (e) {
        console.error("An error occurred during file upload:");
        console.error("Error message:", e.message);
        console.error("Error stack:", e.stack);
        console.error("Form data keys:", Array.from(formData.keys()));
        throw new Error('File upload error');
    }
}

export default parseFormData;
