import config from '../../config';
import { pool } from '../../db';
import type { LoginBody, SignupBody, UserRole } from '../../types';
import bcrypt from 'bcrypt';
import jwt, { type JwtPayload } from 'jsonwebtoken';

const createUserIntoDB = async (payload: SignupBody) => {
  const { name, email, password, role } = payload;

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at, updated_at`,
    [
      name.trim(),
      email.trim(),
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
    [email.trim()],
  );

  return user.rows[0];
};

const loginUser = async (payload: LoginBody) => {
  const { email, password } = payload;

  // Check if the user exists
  const userData = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    email.trim(),
  ]);
  if (userData.rows.length === 0) {
    throw new Error('Invalid Credentials');
  }

  // Compare the password
  const user = userData.rows[0];
  const matchPassword = await bcrypt.compare(password, user.password);

  if (!matchPassword) {
    throw new Error('Invalid Credentials');
  }

  // Generate Token
  const jwtpayload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  const token = jwt.sign(jwtpayload, config.secret as string, {
    expiresIn: '1d',
  });

  delete user.password;

  return { token, user };
};

export const authService = {
  createUserIntoDB,
  findUserByEmail,
  loginUser,
};
