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
exports.downloadFile = void 0;
const supabase_1 = require("../config/supabase");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const TEMP_DIR = path_1.default.join(process.cwd(), 'temp');
const downloadFile = (bucket, filePath) => __awaiter(void 0, void 0, void 0, function* () {
    yield fs_extra_1.default.ensureDir(TEMP_DIR);
    const { data, error } = yield supabase_1.supabase.storage
        .from(bucket)
        .download(filePath);
    if (error) {
        throw new Error(`Failed to download file: ${error.message}`);
    }
    const tempFilePath = path_1.default.join(TEMP_DIR, `${(0, uuid_1.v4)()}_${path_1.default.basename(filePath)}`);
    const buffer = yield data.arrayBuffer();
    yield fs_extra_1.default.writeFile(tempFilePath, Buffer.from(buffer));
    return tempFilePath;
});
exports.downloadFile = downloadFile;
