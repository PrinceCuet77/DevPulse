import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../utils/sendResponse';
import type { CreateIssueBody } from '../../types';
import { validateCreateIssue } from '../../utils/validation';
import { issuesService } from './issues.service';
import type { JwtPayload } from 'jsonwebtoken';

const createIssue = async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const errors = validateCreateIssue(req.body as CreateIssueBody);
    if (errors.length > 0) {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    const issueDetails = await issuesService.createIssue(
      req.user as JwtPayload,
      req.body as CreateIssueBody,
    );

    sendResponse(res, {
      statusCode: StatusCodes.CREATED,
      success: true,
      message: 'Issue created successfully',
      data: issueDetails,
    });
  } catch (error: unknown) {
    console.error('Create issue error:', error);

    sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export const issuesController = {
  createIssue,
};
