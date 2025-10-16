import { Router } from 'express';
import { auth } from '../middlewares/auth';
import { prisma } from '../prisma/client';

const router = Router();

// GET /users - list all users (basic fields)
router.get('/', auth, async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { id: 'asc' },
    select: { id: true, name: true, email: true, createdAt: true }
  });
  return res.json({ success: true, data: users });
});

// GET /users/:id - user details
router.get('/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid user id' });
  }
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, createdAt: true }
  });
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  return res.json({ success: true, data: user });
});

// DELETE /users/:id - delete a user
router.delete('/:id', auth, async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ success: false, message: 'Invalid user id' });
  }
  try {
    await prisma.user.delete({ where: { id } });
    return res.json({ success: true });
  } catch {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
});

export default router;
