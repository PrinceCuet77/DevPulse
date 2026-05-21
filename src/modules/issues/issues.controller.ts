import type { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../utils/sendResponse';
import type {
  CreateIssueBody,
  GetAllIssuesQuery,
  IssueStatus,
  IssueType,
  SortType,
} from '../../types';
import {
  validateCreateIssue,
  validateGetAllIssuesQuery,
} from '../../utils/validation';
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

    const issueDetails = await issuesService.createIssueInDB(
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

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const errors = validateGetAllIssuesQuery(req.query as GetAllIssuesQuery);
    if (errors.length > 0) {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    const queryParams: GetAllIssuesQuery = {};
    if (req.query.sort) {
      queryParams.sort = req.query.sort as SortType;
    } else {
      queryParams.sort = 'newest';
    }

    if (req.query.type) {
      queryParams.type = req.query.type as IssueType;
    }

    if (req.query.status) {
      queryParams.status = req.query.status as IssueStatus;
    }

    const issues = await issuesService.getAllIssuesFromDB(queryParams);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Issues retrieved successfully',
      data: issues,
    });
  } catch (error: unknown) {
    console.error('Get all issues error:', error);

    sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export const issuesController = {
  createIssue,
  getAllIssues,
};
