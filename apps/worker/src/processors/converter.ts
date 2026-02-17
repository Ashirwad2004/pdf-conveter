import libreoffice from 'libreoffice-convert';
import fs from 'fs-extra';
import path from 'path';
import util from 'util';

const convertAsync = util.promisify(libreoffice.convert);

export const convertToPdf = async (inputPath: string, outputFormat: string = 'pdf'): Promise<string> => {
    const ext = path.extname(inputPath);
    const outputPath = inputPath.replace(ext, `.${outputFormat}`);

    const inputBuffer = await fs.readFile(inputPath);

    // Convert using LibreOffice
    const outputBuffer = await convertAsync(inputBuffer, outputFormat, undefined);

    await fs.writeFile(outputPath, outputBuffer);

    return outputPath;
};

// TODO: Add other converters (Image to PDF, Merge, etc)
