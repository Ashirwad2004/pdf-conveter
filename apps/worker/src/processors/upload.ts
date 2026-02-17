import { supabase } from '../config/supabase';
import fs from 'fs-extra';
import path from 'path';

export const uploadFile = async (bucket: string, filePath: string, destinationPath: string): Promise<string> => {
    const fileContent = await fs.readFile(filePath);

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(destinationPath, fileContent, {
            contentType: 'application/pdf', // TODO: Dynamically set based on extension
            upsert: true
        });

    if (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
    }

    return data.path;
};
