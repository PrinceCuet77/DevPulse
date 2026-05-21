import express, {
  type Application,
  type Request,
  type Response,
} from 'express';
import { StatusCodes } from 'http-status-codes';
import { authRoute } from './modules/auth/auth.route';
import { issuesRoute } from './modules/issues/issues.route';
import globalErrorHandler from './middleware/globalErrorHandler';

const app: Application = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'The server is healthy',
  });
});

app.use('/api/auth', authRoute);
app.use('/api/issues', issuesRoute);

// Global error handler
app.use(globalErrorHandler);

export default app;
