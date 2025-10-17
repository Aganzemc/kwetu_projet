import { Router } from 'express';
import { auth } from '../middlewares/auth';
import { prisma } from '../prisma/client';

const router = Router();

// GET /profiles - list basic profiles (users)
router.get('/', auth, async (req, res) => {
  const meId = req.userId;
  const users = await prisma.user.findMany({
    where: meId ? { id: { not: meId } } : undefined,
    orderBy: { id: 'asc' },
    select: { id: true, name: true, email: true, createdAt: true, isOnline: true }
  });
  return res.json({ success: true, data: users });
});

router.get('/me', auth, async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, createdAt: true, isOnline: true }
  });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  return res.json({ success: true, data: user });
});

router.patch('/me', auth, async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const b: any = req.body ?? {};
  const updates: any = {};
  if (typeof b.isOnline === 'boolean') updates.isOnline = b.isOnline;
  if (typeof b.is_online === 'boolean') updates.isOnline = b.is_online;
  if (typeof b.name === 'string') updates.name = String(b.name).trim();

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, message: 'No valid fields to update' });
  }

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: updates,
    select: { id: true, name: true, email: true, createdAt: true, isOnline: true }
  });
  return res.json({ success: true, data: user });
});

export default router;
