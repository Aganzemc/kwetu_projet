import { Router, Request, Response } from 'express';
import { prisma } from '../prisma/client';

const router = Router();

// Users
router.get('/users', async (_req: Request, res: Response) => {
  const users = await prisma.user.findMany({
    where: { deletedAt: null },
    orderBy: { id: 'asc' },
    select: { id: true, name: true, email: true, role: true, isActive: true, isOnline: true, createdAt: true, deletedAt: true }
  });
  res.json({ data: users });
});

router.patch('/users/:id/activate', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { isActive } = req.body as { isActive: boolean };
  if (!Number.isFinite(id) || typeof isActive !== 'boolean') return res.status(400).json({ success: false, message: 'Invalid input' });
  const user = await prisma.user.update({ where: { id }, data: { isActive } });
  res.json({ data: { id: user.id, isActive: user.isActive } });
});

router.delete('/users/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ success: false, message: 'Invalid user id' });
  const user = await prisma.user.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  res.json({ data: { id: user.id, deletedAt: user.deletedAt } });
});

// Groups
router.get('/groups', async (_req: Request, res: Response) => {
  const groups = await prisma.group.findMany({
    where: { deletedAt: null },
    orderBy: { id: 'asc' },
    select: { id: true, name: true, isActive: true, createdAt: true, deletedAt: true }
  });
  res.json({ data: groups });
});

router.patch('/groups/:id/activate', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { isActive } = req.body as { isActive: boolean };
  if (!Number.isFinite(id) || typeof isActive !== 'boolean') return res.status(400).json({ success: false, message: 'Invalid input' });
  const group = await prisma.group.update({ where: { id }, data: { isActive } });
  res.json({ data: { id: group.id, isActive: group.isActive } });
});

router.delete('/groups/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ success: false, message: 'Invalid group id' });
  const group = await prisma.group.update({ where: { id }, data: { deletedAt: new Date(), isActive: false } });
  res.json({ data: { id: group.id, deletedAt: group.deletedAt } });
});

// Private chats (soft-delete messages both directions)
router.delete('/chats', async (req: Request, res: Response) => {
  const { userAId, userBId } = req.body as { userAId: number; userBId: number };
  if (!Number.isFinite(userAId) || !Number.isFinite(userBId)) return res.status(400).json({ success: false, message: 'Invalid user ids' });
  const now = new Date();
  const r1 = await prisma.message.updateMany({
    where: { senderId: userAId, recipientId: userBId, deletedAt: null },
    data: { deletedAt: now }
  });
  const r2 = await prisma.message.updateMany({
    where: { senderId: userBId, recipientId: userAId, deletedAt: null },
    data: { deletedAt: now }
  });
  res.json({ data: { count: r1.count + r2.count } });
});

// Announcements (admin)
router.post('/announcements', async (req: Request, res: Response) => {
  const { title, content } = req.body as { title: string; content: string };
  if (!title?.trim() || !content?.trim()) return res.status(400).json({ success: false, message: 'Title and content required' });
  const authorId = (req as any).userId as number;
  const a = await prisma.announcement.create({ data: { title, content, authorId } });
  res.status(201).json({ data: a });
});

router.delete('/announcements/:id', async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) return res.status(400).json({ success: false, message: 'Invalid announcement id' });
  await prisma.announcement.delete({ where: { id } });
  res.status(204).end();
});

export default router;
