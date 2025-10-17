import { Router } from 'express';
import { auth } from '../middlewares/auth';
import { prisma } from '../prisma/client';

const router = Router();

// GET /messages?peerId=... | groupId=...
router.get('/', auth, async (req, res) => {
  const userId = req.userId!;
  const { peerId, groupId } = req.query as { peerId?: string; groupId?: string };

  try {
    if (groupId) {
      const gid = Number(groupId);
      const isMember = await prisma.groupMember.findFirst({ where: { groupId: gid, userId } });
      if (!isMember) return res.status(403).json({ success: false, message: 'Forbidden' });
      const messages = await prisma.message.findMany({
        where: { groupId: gid },
        orderBy: { createdAt: 'asc' }
      });
      return res.json({ success: true, data: messages });
    }
    if (peerId) {
      const pid = Number(peerId);
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: userId, recipientId: pid },
            { senderId: pid, recipientId: userId }
          ]
        },
        orderBy: { createdAt: 'asc' }
      });
      return res.json({ success: true, data: messages });
    }
    return res.status(400).json({ success: false, message: 'peerId or groupId is required' });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /messages { content, recipientId? , groupId? }
router.post('/', auth, async (req, res) => {
  const userId = req.userId!;
  const { content, recipientId, groupId } = req.body ?? {};
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ success: false, message: 'content is required' });
  }
  if (!recipientId && !groupId) {
    return res.status(400).json({ success: false, message: 'recipientId or groupId is required' });
  }
  try {
    if (groupId) {
      const gid = Number(groupId);
      const isMember = await prisma.groupMember.findFirst({ where: { groupId: gid, userId } });
      if (!isMember) return res.status(403).json({ success: false, message: 'Forbidden' });
      const msg = await prisma.message.create({
        data: { senderId: userId, groupId: gid, content, deliveredAt: new Date() }
      });
      return res.status(201).json({ success: true, data: msg });
    }

    const rid = Number(recipientId);
    const msg = await prisma.message.create({
      data: { senderId: userId, recipientId: rid, content, deliveredAt: new Date() }
    });
    return res.status(201).json({ success: true, data: msg });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /messages/:id/read
router.patch('/:id/read', auth, async (req, res) => {
  const userId = req.userId!;
  const id = Number(req.params.id);
  try {
    const m = await prisma.message.findUnique({ where: { id } });
    if (!m) return res.status(404).json({ success: false, message: 'Not found' });

    // receiver in private chat
    if (m.recipientId && m.recipientId !== userId) return res.status(403).json({ success: false, message: 'Forbidden' });

    // group: any member can mark read for themself (simplified)
    if (m.groupId) {
      const isMember = await prisma.groupMember.findFirst({ where: { groupId: m.groupId, userId } });
      if (!isMember) return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const updated = await prisma.message.update({ where: { id }, data: { readAt: new Date() } });
    return res.json({ success: true, data: updated });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
