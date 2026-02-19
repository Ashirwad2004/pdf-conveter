import { Router } from 'express';
import { createJob, createJobSchema, getJobStatus } from '../controllers/jobs';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/', validate(createJobSchema), createJob);
router.get('/:id', getJobStatus);

export default router;
