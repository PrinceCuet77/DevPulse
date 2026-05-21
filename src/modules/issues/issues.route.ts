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

router.patch(
  '/:id',
  auth('contributor', 'maintainer'),
  issuesController.updateSingleIssue,
);

router.delete('/:id', auth('maintainer'), issuesController.deleteSingleIssue);

export const issuesRoute = router;
