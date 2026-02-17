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
exports.uploadFile = void 0;
const supabase_1 = require("../config/supabase");
const fs_extra_1 = __importDefault(require("fs-extra"));
const uploadFile = (bucket, filePath, destinationPath) => __awaiter(void 0, void 0, void 0, function* () {
    const fileContent = yield fs_extra_1.default.readFile(filePath);
    const { data, error } = yield supabase_1.supabase.storage
        .from(bucket)
        .upload(destinationPath, fileContent, {
        contentType: 'application/pdf', // TODO: Dynamically set based on extension
        upsert: true
    });
    if (error) {
        throw new Error(`Failed to upload file: ${error.message}`);
    }
    return data.path;
});
exports.uploadFile = uploadFile;
