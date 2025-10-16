import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { createPool } from './lib/db.js';
import authRouter from './routes/auth.js';
import profilesRouter from './routes/profiles.js';
import messagesRouter from './routes/messages.js';
import groupsRouter from './routes/groups.js';
import uploadsRouter from './routes/uploads.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// db pool attach
app.use((req, res, next) => {
  req.db = createPool();
  next();
});

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/auth', authRouter);
app.use('/profiles', profilesRouter);
app.use('/messages', messagesRouter);
app.use('/groups', groupsRouter);
app.use('/uploads', uploadsRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on :${port}`);
});


