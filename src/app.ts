import express, {
  type Application,
  type Request,
  type Response,
} from 'express';
import { StatusCodes } from 'http-status-codes';

const app: Application = express();

app.get('/health', (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'The server is healthy',
  });
});

export default app;
