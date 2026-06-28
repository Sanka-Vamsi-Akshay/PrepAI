import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '@backend/middlewares/auth';
import * as resumeController from '@backend/controllers/resume.controller';
import { BadRequestError } from '@backend/utils/appError';
import { resumeUploadRateLimiter } from '@backend/middlewares/rateLimiter';

// Ensure the local uploads/resumes directory exists
const uploadDir = path.resolve(__dirname, '../../../../uploads/resumes');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Unique filename construction
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `resume-${uniqueSuffix}${ext}`);
  },
});

// Multer file filter to enforce PDF and DOCX only (strictly checking allowed mime types)
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedExtensions = ['.pdf', '.docx'];
  const allowedMimeTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const ext = path.extname(file.originalname).toLowerCase();
  const isValidExt = allowedExtensions.includes(ext);
  const isValidMime = allowedMimeTypes.includes(file.mimetype);

  if (isValidExt && isValidMime) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only PDF and DOCX formats with valid MIME types are supported.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1, // limit uploads to 1 file per request
  },
});

const router = Router();

// Protect all resume management endpoints
router.use(authenticate);

router.post('/upload', resumeUploadRateLimiter, upload.single('resume'), resumeController.uploadResume);
router.get('/', resumeController.getResumes);
router.get('/:id', resumeController.getResumeById);
router.get('/:id/gap-analysis', resumeController.getResumeGapAnalysis);
router.delete('/:id', resumeController.deleteResume);

export default router;
