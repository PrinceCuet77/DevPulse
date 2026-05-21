import type { NextFunction, Request, Response } from 'express';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import config from '../config';
import { pool } from '../db';
import type { UserRole } from '../types';
import { StatusCodes } from 'http-status-codes';
import sendResponse from '../utils/sendResponse';

const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        sendResponse(res, {
          statusCode: StatusCodes.UNAUTHORIZED,
          success: false,
          message: 'Unauthorized access!, Token is missing',
        });
        return;
      }

      const decoded = jwt.verify(
        token as string,
        config.secret as string,
      ) as JwtPayload;

      const userData = await pool.query(`SELECT * FROM users WHERE email=$1`, [
        decoded.email,
      ]);

      const user = userData.rows[0];
      if (userData.rows.length === 0) {
        sendResponse(res, {
          statusCode: StatusCodes.NOT_FOUND,
          success: false,
          message: 'User not found!',
        });
        return;
      }

      if (roles.length && !roles.includes(user.role)) {
        sendResponse(res, {
          statusCode: StatusCodes.FORBIDDEN,
          success: false,
          message: 'Forbidden!, This role have no access!',
        });
        return;
      }

      req.user = decoded;

      next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        sendResponse(res, {
          statusCode: StatusCodes.UNAUTHORIZED,
          success: false,
          message:
            error instanceof jwt.TokenExpiredError
              ? 'Token has expired'
              : 'Invalid token',
        });
        return;
      }
      next(error);
    }
  };
};

export default auth;
