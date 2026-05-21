import type { UserRole } from '../types';

export interface ValidationError {
  field: string;
  message: string;
}

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const isValidRole = (role: string): role is UserRole => {
  return role === 'contributor' || role === 'maintainer';
};

export const validateSignup = (body: {
  name: unknown;
  email: unknown;
  password: unknown;
  role?: unknown;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
    errors.push({ field: 'name', message: 'Name is required' });
  }

  if (!body.email || typeof body.email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else if (!isValidEmail(body.email)) {
    errors.push({
      field: 'email',
      message: 'Email must be a valid email address',
    });
  }

  if (!body.password || typeof body.password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if ((body.password as string).length < 6) {
    errors.push({
      field: 'password',
      message: 'Password must be at least 6 characters',
    });
  }

  if (body.role !== undefined && !isValidRole(body.role as string)) {
    errors.push({
      field: 'role',
      message: 'Role must be contributor or maintainer',
    });
  }

  return errors;
};
