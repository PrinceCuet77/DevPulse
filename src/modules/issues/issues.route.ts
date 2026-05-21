import { Router } from 'express';
import { issuesController } from './issues.controller';
import auth from '../../middleware/auth';

const router = Router();

router.post(
  '/',
  auth('contributor', 'maintainer'),
  issuesController.createIssue,
);

router.get('/', issuesController.getAllIssues);

router.get('/:id', issuesController.getSingleIssue);

export const issuesRoute = router;
