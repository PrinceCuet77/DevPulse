import express, {
  type Application,
  type Request,
  type Response,
} from 'express';
import { StatusCodes } from 'http-status-codes';
import { authRoute } from './auth/auth.route';

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

export default app;
