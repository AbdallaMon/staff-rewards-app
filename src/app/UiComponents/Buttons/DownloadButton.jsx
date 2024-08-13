import React, {useState} from 'react';
import Button from '@mui/material/Button';
import axios from 'axios';
import {saveAs} from 'file-saver';
import FullScreenLoader from "@/app/UiComponents/Feedback/FullscreenLoader";

const DownloadButton = ({data}) => {
    const [loading, setLoading] = useState(false);

    const handleDownload = async () => {
        setLoading(true); // Start loading indicator

        const urlData = data
              .filter(item => item.attachment)
              .map((item, index) => ({
                  url: item.attachment.split('?')[0] + '/download',
                  filename: `${item.user.name}_${index + 1}.pdf`
              }));

        try {
            const response = await axios.post('/api/finincal/download', {
                files: urlData
            }, {
                responseType: 'blob'
            });

            // Trigger the download of the zipped file
            saveAs(response.data, 'attachments.zip');
        } catch (error) {
            console.error('Error downloading ZIP file:', error.message);
        } finally {
            setLoading(false); // Stop loading indicator
        }
    };

    return (
          <div>
              <Button
                    variant="contained"
                    color="primary"
                    onClick={handleDownload}
                    disabled={loading} // Disable the button while loading
              >
                  {loading ? 'Downloading...' : 'Download All Attachments'}
              </Button>
              {loading && <FullScreenLoader/>}
          </div>
    );
};

export default DownloadButton;
