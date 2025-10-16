import { Router } from 'express';
import { auth } from '../middlewares/auth';
import { prisma } from '../prisma/client';

const router = Router();

router.get('/me', auth, async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, createdAt: true }
  });
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }
  return res.json({ success: true, data: user });
});

export default router;
