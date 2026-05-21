import type { Response } from "express";
import type { StatusCodes } from 'http-status-codes';

type TResponse<T> = {
  statusCode: StatusCodes;
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown;
};

const sendResponse = <T>(res: Response, data: TResponse<T>) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message,
    data: data.data,
    errors: data.errors,
  });
};

export default sendResponse;
