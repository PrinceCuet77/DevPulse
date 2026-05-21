import type { JwtPayload } from 'jsonwebtoken';
import { pool } from '../../db';
import type { CreateIssueBody, GetAllIssuesQuery } from '../../types';

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
  if (type) {
    values.push(type);
  }
  if (status) {
    values.push(status);
  }

  const issuesResult = await pool.query(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues
     WHERE ${type ? `type = $1` : ''} AND ${status ? `status = $2` : ''}
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

export const issuesService = {
  createIssueInDB,
  getAllIssuesFromDB,
};
