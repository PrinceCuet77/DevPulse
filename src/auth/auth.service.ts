import { pool } from '../db';
import type { SignupBody, UserRole } from '../types';
import bcrypt from 'bcrypt';

const createUserIntoDB = async (payload: SignupBody) => {
  const { name, email, password, role } = payload;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [
      name.trim(),
      email.toLowerCase(),
      hashedPassword,
      role ? role : ('contributor' as UserRole),
    ],
  );

  if (!user || user.rows.length === 0) {
    throw new Error('Failed to create/register user in db');
  }

  return user.rows[0];
};

const findUserByEmail = async (email: string) => {
  const user = await pool.query(
    `SELECT id, name, email, password, role, created_at, updated_at
     FROM users
     WHERE email = $1`,
    [email.toLowerCase()],
  );

  return user.rows[0];
};

export const authService = {
  createUserIntoDB,
  findUserByEmail
};
