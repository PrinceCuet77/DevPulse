import type { NextFunction, Request, Response } from 'express';
import sendResponse from '../utils/sendResponse';
import { StatusCodes } from 'http-status-codes';

const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error('Unhandled error:', err.message);
  sendResponse(res, {
    statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
    success: false,
    message: err.message || 'Internal Server Error',
  });
};

export default globalErrorHandler;
