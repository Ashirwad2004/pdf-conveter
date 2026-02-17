import { Router } from 'express';
import { createJob, createJobSchema } from '../controllers/jobs';
import { validate } from '../middleware/validate';

const router = Router();

router.post('/', validate(createJobSchema), createJob);

export default router;
