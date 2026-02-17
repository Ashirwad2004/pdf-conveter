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
exports.convertToPdf = void 0;
const libreoffice_convert_1 = __importDefault(require("libreoffice-convert"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const util_1 = __importDefault(require("util"));
const convertAsync = util_1.default.promisify(libreoffice_convert_1.default.convert);
const convertToPdf = (inputPath_1, ...args_1) => __awaiter(void 0, [inputPath_1, ...args_1], void 0, function* (inputPath, outputFormat = 'pdf') {
    const ext = path_1.default.extname(inputPath);
    const outputPath = inputPath.replace(ext, `.${outputFormat}`);
    const inputBuffer = yield fs_extra_1.default.readFile(inputPath);
    // Convert using LibreOffice
    const outputBuffer = yield convertAsync(inputBuffer, outputFormat, undefined);
    yield fs_extra_1.default.writeFile(outputPath, outputBuffer);
    return outputPath;
});
exports.convertToPdf = convertToPdf;
// TODO: Add other converters (Image to PDF, Merge, etc)
