import { Router } from 'express';
import { auth } from '../middlewares/auth';
import { prisma } from '../prisma/client';
import type { User } from '@prisma/client';

const router = Router();

// GET /conversations - returns a mixed list of private peers and groups with last message info
router.get('/', auth, async (req, res) => {
  const userId = req.userId!;
  try {
    // Last messages for private conversations
    const lastPrivates = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, recipientId: { not: null } },
          { recipientId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
      select: {
        id: true,
        content: true,
        createdAt: true,
        senderId: true,
        recipientId: true,
        groupId: true,
        readAt: true
      }
    });

    // Build a map of peerId -> last message
    const privateMap = new Map<number, typeof lastPrivates[number]>();
    for (const m of lastPrivates) {
      if (m.groupId) continue;
      const peerId = m.senderId === userId ? (m.recipientId as number) : m.senderId;
      if (!privateMap.has(peerId)) privateMap.set(peerId, m);
    }

    const peerIds = Array.from(privateMap.keys());
    const peers: Array<Pick<User, 'id' | 'name' | 'email'>> = peerIds.length
      ? await prisma.user.findMany({
          where: { id: { in: peerIds } },
          select: { id: true, name: true, email: true }
        })
      : [];
    const peerById = new Map<number, Pick<User, 'id' | 'name' | 'email'>>(
      peers.map((p) => [p.id, p])
    );

    const privateConversations = peerIds.map((pid) => {
      const m = privateMap.get(pid)!;
      const peer = peerById.get(pid);
      return {
        type: 'private' as const,
        id: String(pid),
        name: peer?.name || String(pid),
        lastMessage: m.content,
        lastAt: m.createdAt,
        lastSenderId: m.senderId
      };
    });

    // Groups where user is a member
    const memberships = await prisma.groupMember.findMany({
      where: { userId },
      select: { groupId: true }
    });
    const groupIds = memberships.map((m: { groupId: number }) => m.groupId);

    let groupConversations: any[] = [];
    if (groupIds.length) {
      const groups = await prisma.group.findMany({
        where: { id: { in: groupIds } },
        select: { id: true, name: true }
      });
      const lastGroupMessages = await prisma.message.findMany({
        where: { groupId: { in: groupIds } },
        orderBy: { createdAt: 'desc' },
        take: 200,
        select: { id: true, content: true, createdAt: true, senderId: true, groupId: true }
      });
      const lastByGroup = new Map<number, typeof lastGroupMessages[number]>();
      for (const m of lastGroupMessages) {
        if (!lastByGroup.has(m.groupId!)) lastByGroup.set(m.groupId!, m);
      }
      const groupById = new Map<number, { id: number; name: string }>(
        groups.map((g: { id: number; name: string }) => [g.id, g])
      );
      groupConversations = Array.from(lastByGroup.entries()).map(([gid, m]: [number, typeof lastGroupMessages[number]]) => ({
        type: 'group' as const,
        id: String(gid),
        name: groupById.get(gid)?.name || String(gid),
        lastMessage: m.content,
        lastAt: m.createdAt,
        lastSenderId: m.senderId
      }));
    }

    const conversations = [...privateConversations, ...groupConversations]
      .sort((a, b) => new Date(b.lastAt).getTime() - new Date(a.lastAt).getTime());

    return res.json({ success: true, data: conversations });
  } catch (e) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
