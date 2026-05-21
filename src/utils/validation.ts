import type { IssueType, UserRole } from '../types';

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

export const isValidIssueType = (type: string): type is IssueType => {
  return type === 'bug' || type === 'feature_request';
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

  const otherErrors = validateLogin({
    email: body.email,
    password: body.password,
  });
  otherErrors.forEach((error) => errors.push(error));

  if (body.role !== undefined && !isValidRole(body.role as string)) {
    errors.push({
      field: 'role',
      message: 'Role must be contributor or maintainer',
    });
  }

  return errors;
};

export const validateLogin = (body: {
  email: unknown;
  password: unknown;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

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

  return errors;
};

export const validateCreateIssue = (body: {
  title: unknown;
  description: unknown;
  type: unknown;
}): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (
    !body.title ||
    typeof body.title !== 'string' ||
    body.title.trim() === ''
  ) {
    errors.push({ field: 'title', message: 'Title is required' });
  }

  if (
    body.title &&
    typeof body.title === 'string' &&
    body.title.trim().length >= 150
  ) {
    errors.push({
      field: 'title',
      message: 'Title must be equal or less than 150 characters',
    });
  }

  if (
    !body.description ||
    typeof body.description !== 'string' ||
    body.description.trim() === ''
  ) {
    errors.push({ field: 'description', message: 'Description is required' });
  }

  if (
    body.description &&
    typeof body.description === 'string' &&
    body.description.trim().length < 20
  ) {
    errors.push({
      field: 'description',
      message: 'Description must be at least 20 characters',
    });
  }

  if (
    !body.type ||
    typeof body.type !== 'string' ||
    !isValidIssueType(body.type)
  ) {
    errors.push({
      field: 'type',
      message: 'Type must be bug or feature_request',
    });
  }

  return errors;
};
