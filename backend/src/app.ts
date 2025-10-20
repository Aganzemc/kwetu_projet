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
import adminRouter from './routes/admin.routes';
import { auth, requireAdmin } from './middlewares/auth';
import { prisma } from './prisma/client';

dotenv.config();

const app = express();

// CORS: read allowed origins from env (comma-separated)
const origins = (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
app.use(cors({
  origin: origins.length ? origins : undefined,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple health check for Render
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).send('OK');
});

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

// Public announcements (everyone can read)
app.get('/announcements', async (_req: Request, res: Response) => {
  const list = await prisma.announcement.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ data: list });
});

// Admin routes (protected)
app.use('/admin', auth, requireAdmin, adminRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
