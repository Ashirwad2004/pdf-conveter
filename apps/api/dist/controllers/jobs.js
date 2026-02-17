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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJob = exports.createJobSchema = void 0;
const queue_1 = require("../queue");
const zod_1 = require("zod");
exports.createJobSchema = zod_1.z.object({
    body: zod_1.z.object({
        original_file_path: zod_1.z.string().min(1),
        conversion_type: zod_1.z.enum([
            'pdf-to-word',
            'word-to-pdf',
            'pdf-to-jpg',
            'jpg-to-pdf',
            'merge-pdf',
            'split-pdf',
            'compress-pdf',
            'rotate-pdf',
            'excel-to-pdf',
            'ppt-to-pdf'
        ]),
        options: zod_1.z.record(zod_1.z.string(), zod_1.z.any()).optional(),
    }),
});
const createJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { original_file_path, conversion_type, options } = req.body;
        // TODO: Check user usage limits here (DB check)
        const job = yield queue_1.conversionQueue.add('convert', {
            original_file_path,
            conversion_type,
            options,
            userId: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 'anon'
        }, {
            attempts: 3,
            backoff: {
                type: 'exponential',
                delay: 1000,
            },
            removeOnComplete: {
                age: 24 * 3600, // Keep for 24 hours
                count: 1000
            },
            removeOnFail: {
                age: 7 * 24 * 3600 // Keep for 7 days
            }
        });
        res.status(201).json({
            status: 'success',
            message: 'Job created successfully',
            jobId: job.id,
        });
    }
    catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
});
exports.createJob = createJob;
