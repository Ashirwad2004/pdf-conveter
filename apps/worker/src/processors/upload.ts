import { supabase } from '../config/supabase';
import fs from 'fs-extra';
import path from 'path';

export const uploadFile = async (bucket: string, filePath: string, destinationPath: string): Promise<string> => {

    // Local file strategy for dev (save to api/uploads/converted)
    // Destination path is like "converted/userId/filename.pdf"
    const localUploadsDir = path.resolve(process.cwd(), '../api/uploads');
    const fullDestPath = path.join(localUploadsDir, destinationPath); // Ensure destinationPath includes "converted/" prefix if needed

    // Quick hack: destinationPath comes in as "converted/userId/file.pdf"
    // We want to save it there.

    await fs.ensureDir(path.dirname(fullDestPath));
    await fs.copy(filePath, fullDestPath);

    // Return a local URL (assuming API serves static files, or just path for now)
    // We need to serve these files from API.
    return `http://localhost:3001/api/v1/download?path=${encodeURIComponent(destinationPath)}`;

    /*
    const fileContent = await fs.readFile(filePath);

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(destinationPath, fileContent, {
            contentType: 'application/pdf', 
            upsert: true
        });

    if (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
    }

    return data.path;
    */
};
