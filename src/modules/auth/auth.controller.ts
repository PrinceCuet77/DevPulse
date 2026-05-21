import type { Request, Response } from 'express';
import { authService } from './auth.service';
import { StatusCodes } from 'http-status-codes';
import { validateLogin, validateSignup } from '../../utils/validation';
import type { LoginBody, SignupBody } from '../../types';
import sendResponse from '../../utils/sendResponse';

const signupUser = async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const errors = validateSignup(req.body as SignupBody);
    if (errors.length > 0) {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    // Check if a user with the same email already exists
    const existingUser = await authService.findUserByEmail(
      req.body.email as string,
    );
    if (existingUser) {
      sendResponse(res, {
        statusCode: StatusCodes.CONFLICT,
        success: false,
        message: 'An account with this email already exists',
      });
      return;
    }

    // Create a new user in the db
    const user = await authService.createUserIntoDB(req.body as SignupBody);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'User registered successfully',
      data: user,
    });
  } catch (error: unknown) {
    console.error('Signup error:', error);

    sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Internal Server Error',
    });
  }
};

const loginUser = async (req: Request, res: Response) => {
  try {
    // Validate the request body
    const errors = validateLogin(req.body as LoginBody);
    if (errors.length > 0) {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    // Create a new user in the db
    const { token, user } = await authService.loginUser(req.body as LoginBody);

    sendResponse(res, {
      statusCode: StatusCodes.OK,
      success: true,
      message: 'Login successful',
      data: {
        token,
        user,
      },
    });
  } catch (error: unknown) {
    console.error('Login error:', error);
    if (error instanceof Error && error.message === 'Invalid Credentials') {
      sendResponse(res, {
        statusCode: StatusCodes.BAD_REQUEST,
        success: false,
        message: 'Invalid email or password.',
      });
      return;
    }

    sendResponse(res, {
      statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      success: false,
      message: 'Internal Server Error',
    });
  }
};

export const authController = {
  signupUser,
  loginUser,
};
