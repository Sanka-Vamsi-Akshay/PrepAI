import { Router } from 'express';
import {
  createSubmission,
  getSubmissions,
  getSubmissionById,
  updateSubmission,
} from '@backend/controllers/submission.controller';
import { validate } from '@backend/validators/validate.middleware';
import {
  createSubmissionSchema,
  getSubmissionsQuerySchema,
  getSubmissionByIdSchema,
  updateSubmissionSchema,
} from '@backend/validators/submission.validator';
import { authenticate } from '@backend/middlewares/auth';

const router = Router();

// Protect all submissions routes
router.use(authenticate);

router.post('/', validate(createSubmissionSchema), createSubmission);
router.get('/', validate(getSubmissionsQuerySchema), getSubmissions);
router.get('/:id', validate(getSubmissionByIdSchema), getSubmissionById);
router.patch('/:id', validate(updateSubmissionSchema), updateSubmission);

export default router;
