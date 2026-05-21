import type { JwtPayload } from 'jsonwebtoken';
import { pool } from '../../db';
import type { CreateIssueBody } from '../../types';

const createIssue = async (
  userDetails: JwtPayload,
  payload: CreateIssueBody,
) => {
  const { title, description, type } = payload;

  const issue = await pool.query(
    `INSERT INTO issues (title, description, type, reporter_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    [title.trim(), description.trim(), type.trim(), userDetails.id],
  );

  return issue.rows[0];
};

export const issuesService = {
  createIssue,
};
