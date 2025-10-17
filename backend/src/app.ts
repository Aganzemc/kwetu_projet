import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes';
import { errorHandler, notFound } from './middlewares/errorHandler';
import type { Request, Response } from 'express';
import profileRouter from './routes/profile.routes';
import usersRouter from './routes/users.routes';
import groupsRouter from './routes/groups.routes';
import messagesRouter from './routes/messages.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRouter);
// Alias sans le préfixe /api pour compatibilité avec le frontend existant
app.use('/auth', authRouter);
app.use('/profiles', profileRouter);
app.use('/users', usersRouter);
app.use('/groups', groupsRouter);
app.use('/messages', messagesRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
