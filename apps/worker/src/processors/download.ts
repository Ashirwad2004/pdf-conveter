import { supabase } from '../config/supabase';
import fs from 'fs-extra';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const TEMP_DIR = path.join(process.cwd(), 'temp');

export const downloadFile = async (bucket: string, filePath: string): Promise<string> => {
    await fs.ensureDir(TEMP_DIR);

    const { data, error } = await supabase.storage
        .from(bucket)
        .download(filePath);

    if (error) {
        throw new Error(`Failed to download file: ${error.message}`);
    }

    const tempFilePath = path.join(TEMP_DIR, `${uuidv4()}_${path.basename(filePath)}`);
    const buffer = await data.arrayBuffer();
    await fs.writeFile(tempFilePath, Buffer.from(buffer));

    return tempFilePath;
};
