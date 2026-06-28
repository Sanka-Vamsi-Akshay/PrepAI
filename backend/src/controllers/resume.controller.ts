import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@backend/types';
import * as resumeService from '@backend/services/resume.service';
import { sendSuccessResponse } from '@backend/utils/response';
import { BadRequestError } from '@backend/utils/appError';

export const uploadResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const file = req.file;

    if (!file) {
      throw new BadRequestError('No file uploaded. Please upload a PDF or DOCX file.');
    }

    const resume = await resumeService.createResume(userId, {
      originalname: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
    });

    sendSuccessResponse(res, {
      statusCode: 201,
      message: 'Resume uploaded and analyzed successfully',
      data: { resume },
    });
  } catch (error) {
    next(error);
  }
};

export const getResumes = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const resumes = await resumeService.getUserResumes(userId);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Resumes retrieved successfully',
      data: { resumes },
    });
  } catch (error) {
    next(error);
  }
};

export const getResumeById = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    
    const resume = await resumeService.getResumeById(id, userId);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Resume details retrieved successfully',
      data: { resume },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await resumeService.deleteResume(id, userId);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: 'Resume deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

export const getResumeGapAnalysis = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const domain = (req.query.domain || 'FULL_STACK').toString().toUpperCase();

    const resume = await resumeService.getResumeById(id, userId);
    
    // Extract skills array from parsedData
    const skills = (resume.parsedData as any)?.skills || [];
    const missingSkills = resumeService.performGapAnalysis(skills, domain);

    sendSuccessResponse(res, {
      statusCode: 200,
      message: `Gap analysis for domain ${domain} completed`,
      data: {
        domain,
        resumeSkills: skills,
        missingSkills,
      },
    });
  } catch (error) {
    next(error);
  }
};
