"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bullmq_1 = require("bullmq");
const dotenv_1 = __importDefault(require("dotenv"));
const ioredis_1 = __importDefault(require("ioredis"));
const download_1 = require("./processors/download");
const upload_1 = require("./processors/upload");
const converter_1 = require("./processors/converter");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const redisConnection = new ioredis_1.default(process.env.REDIS_URL || 'redis://localhost:6379', {
    maxRetriesPerRequest: null
});
const worker = new bullmq_1.Worker('conversion-queue', (job) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Processing job ${job.id} of type ${job.name}`);
    const { original_file_path, conversion_type, userId } = job.data;
    let tempInputPath = '';
    let tempOutputPath = '';
    try {
        // 1. Download
        console.log(`Downloading ${original_file_path}...`);
        tempInputPath = yield (0, download_1.downloadFile)('raw_files', original_file_path);
        // 2. Convert
        console.log(`Converting ${tempInputPath}...`);
        if (conversion_type === 'word-to-pdf' || conversion_type === 'excel-to-pdf' || conversion_type === 'ppt-to-pdf') {
            tempOutputPath = yield (0, converter_1.convertToPdf)(tempInputPath, 'pdf');
        }
        else {
            // Placeholder for other types
            console.log(`Conversion type ${conversion_type} not fully implemented, simulating...`);
            yield new Promise(resolve => setTimeout(resolve, 1000));
            tempOutputPath = tempInputPath; // Just return original for now
        }
        // 3. Upload
        const outputFileName = `converted/${userId}/${path_1.default.basename(tempOutputPath)}`;
        console.log(`Uploading to ${outputFileName}...`);
        const publicUrl = yield (0, upload_1.uploadFile)('converted_files', tempOutputPath, outputFileName);
        return { status: 'completed', resultUrl: publicUrl };
    }
    catch (error) {
        console.error(`Job failed: ${error.message}`);
        throw error;
    }
    finally {
        // 4. Cleanup
        if (tempInputPath && (yield fs_extra_1.default.pathExists(tempInputPath))) {
            try {
                yield fs_extra_1.default.unlink(tempInputPath);
            }
            catch (e) {
                console.error('Failed to cleanup input', e);
            }
        }
        if (tempOutputPath && (yield fs_extra_1.default.pathExists(tempOutputPath)) && tempOutputPath !== tempInputPath) {
            try {
                yield fs_extra_1.default.unlink(tempOutputPath);
            }
            catch (e) {
                console.error('Failed to cleanup output', e);
            }
        }
    }
}), {
    connection: redisConnection,
    concurrency: 5
});
worker.on('completed', job => {
    console.log(`Job ${job.id} has completed!`);
});
worker.on('failed', (job, err) => {
    console.log(`Job ${job === null || job === void 0 ? void 0 : job.id} has failed with ${err.message}`);
});
console.log('Worker Service (with LibreOffice) started...');
