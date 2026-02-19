import { Request, Response } from 'express';
import { conversionQueue } from '../queue';
import { z } from 'zod';

export const createJobSchema = z.object({
    body: z.object({
        original_file_path: z.string().min(1),
        conversion_type: z.enum([
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
        options: z.record(z.string(), z.any()).optional(),
    }),
});

export const createJob = async (req: Request, res: Response) => {
    try {
        const { original_file_path, conversion_type, options } = req.body;

        // TODO: Check user usage limits here (DB check)

        const job = await conversionQueue.add('convert', {
            original_file_path,
            conversion_type,
            options,
            userId: (req as any).user?.id || 'anon'
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
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};

export const getJobStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const job = await conversionQueue.getJob(id as string);

        if (!job) {
            return res.status(404).json({ status: 'error', message: 'Job not found' });
        }

        const state = await job.getState();
        const result = job.returnvalue;

        res.json({
            status: 'success',
            jobId: job.id,
            state,
            result
        });
    } catch (error) {
        console.error('Error fetching job status:', error);
        res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
};
