import type { JwtPayload } from 'jsonwebtoken';
import { pool } from '../../db';
import type {
  CreateIssueBody,
  GetAllIssuesQuery,
  UpdateIssueBody,
} from '../../types';

const createIssueInDB = async (
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

const getAllIssuesFromDB = async (query: GetAllIssuesQuery) => {
  const { sort, type, status } = query;

  const values: string[] = [];
  const fields: string[] = [];
  if (type) {
    values.push(type);
    fields.push(`type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    fields.push(`status = $${values.length}`);
  }

  const issuesResult = await pool.query(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues
     ${fields.length > 0 ? `WHERE ${fields.join(' AND ')}` : ''}
     ORDER BY created_at ${sort === 'oldest' ? 'ASC' : 'DESC'}`,
    values,
  );

  const issues = issuesResult.rows;
  if (issues.length === 0) {
    return [];
  }

  const allReporterIds = issues.map((issue) => issue.reporter_id as number);
  const uniqueReporterIds = [...new Set(allReporterIds)];
  const uniqueReporterIdsForQuery = uniqueReporterIds.map(
    (value, index) => `$${index + 1}`,
  );
  const reportersResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id IN (${uniqueReporterIdsForQuery.join(', ')})`,
    uniqueReporterIds,
  );

  const allReportersData = reportersResult.rows;
  const reporterObj = Object.fromEntries(
    allReportersData.map((reporter) => [reporter.id, reporter]),
  );

  const fullIssueList = issues.map((issue) => ({
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporterObj[issue.reporter_id] ?? null,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  }));

  return fullIssueList;
};

const getSingleIssueFromDB = async (issueId: string) => {
  const issueResult = await pool.query(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues
     WHERE id = $1`,
    [issueId],
  );

  const issue = issueResult.rows[0];
  if (issueResult.rows.length === 0) {
    return null;
  }

  const reporterResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = $1`,
    [issue.reporter_id],
  );

  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporterResult.rows[0] ?? null,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};

const updateSingleIssueInDB = async (
  issueId: string,
  userDetails: JwtPayload,
  payload: UpdateIssueBody,
) => { 
  const { title, description, type } = payload;
  const issueResult = await pool.query(
    `SELECT id, title, status, reporter_id FROM issues WHERE id = $1`,
    [issueId],
  );

  if (issueResult.rows.length === 0) {
    return null;
  }

  const issue = issueResult.rows[0];
  if (userDetails.role === 'contributor') {
    if (issue.reporter_id !== userDetails.id || issue.status !== 'open') {
      throw new Error('FORBIDDEN');
    }
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (title) {
    values.push(title.trim());
    fields.push(`title = $${values.length}`);
  }

  if (description) {
    values.push(description.trim());
    fields.push(`description = $${values.length}`);
  }

  if (type) {
    values.push(type);
    fields.push(`type = $${values.length}`);
  }

  values.push(issueId);

  const updatedResult = await pool.query(
    `UPDATE issues SET ${fields.join(', ')}, updated_at = NOW()
     WHERE id = $${values.length}
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    values,
  );

  return updatedResult.rows[0];
};

const deleteSingleIssueInDB = async (issueId: string) => {
  const issueResult = await pool.query(
    `DELETE FROM issues
     WHERE id = $1
     RETURNING id`,
    [issueId],
  );

  const issue = issueResult.rows[0];
  if (!issue) {
    return null;
  }

  return {
    id: issue.id,
  };
};

export const issuesService = {
  createIssueInDB,
  getAllIssuesFromDB,
  getSingleIssueFromDB,
  updateSingleIssueInDB,
  deleteSingleIssueInDB,
};
