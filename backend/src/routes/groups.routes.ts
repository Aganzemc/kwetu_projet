import { Router } from 'express';
import { auth } from '../middlewares/auth';
import { prisma } from '../prisma/client';

const router = Router();

// GET /groups - list all groups
router.get('/', auth, async (_req, res) => {
  const groups = await prisma.group.findMany({
    orderBy: { id: 'asc' },
    select: { id: true, name: true, createdAt: true, creatorId: true }
  });
  return res.json({ success: true, data: groups });
});

// POST /groups - create a group { name }
router.post('/', auth, async (req, res) => {
  const { name } = req.body ?? {};
  if (!name || String(name).trim().length === 0) {
    return res.status(400).json({ success: false, message: 'Name is required' });
  }
  if (!req.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const group = await prisma.group.create({
    data: { name: String(name).trim(), creatorId: req.userId },
    select: {
      id: true,
      name: true,
      createdAt: true,
      creator: { select: { id: true, name: true, email: true } }
    }
  });
  // add creator as first member
  await prisma.groupMember.create({ data: { groupId: group.id, userId: req.userId } });
  return res.status(201).json({ success: true, data: group });
});

// POST /groups/:id/members { userId }
router.post('/:id/members', auth, async (req, res) => {
  const gid = Number(req.params.id);
  const { userId } = req.body ?? {};
  if (Number.isNaN(gid)) return res.status(400).json({ success: false, message: 'Invalid group id' });
  if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

  // Only creator or existing member can add
  const group = await prisma.group.findUnique({ where: { id: gid }, select: { creatorId: true } });
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
  if (group.creatorId !== req.userId) {
    const isMember = await prisma.groupMember.findFirst({ where: { groupId: gid, userId: req.userId! } });
    if (!isMember) return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  // Avoid duplicates
  const exists = await prisma.groupMember.findFirst({ where: { groupId: gid, userId: Number(userId) } });
  if (exists) return res.json({ success: true, data: exists });

  const membership = await prisma.groupMember.create({
    data: { groupId: gid, userId: Number(userId) }
  });
  return res.status(201).json({ success: true, data: membership });
});

// GET /groups/:id/members - list group members (users)
router.get('/:id/members', auth, async (req, res) => {
  const gid = Number(req.params.id);
  if (Number.isNaN(gid)) return res.status(400).json({ success: false, message: 'Invalid group id' });
  // Only members (or creator) can view members list
  const group = await prisma.group.findUnique({ where: { id: gid }, select: { creatorId: true } });
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
  if (group.creatorId !== req.userId) {
    const isMember = await prisma.groupMember.findFirst({ where: { groupId: gid, userId: req.userId! } });
    if (!isMember) return res.status(403).json({ success: false, message: 'Forbidden' });
  }
  const members = await prisma.groupMember.findMany({
    where: { groupId: gid },
    select: { user: { select: { id: true, name: true, email: true } } }
  });
  return res.json({ success: true, data: members.map((m) => m.user) });
});

// POST /groups/:id/leave - current user leaves the group (creator cannot leave)
router.post('/:id/leave', auth, async (req, res) => {
  const gid = Number(req.params.id);
  const uid = req.userId!;
  if (Number.isNaN(gid)) return res.status(400).json({ success: false, message: 'Invalid group id' });

  const group = await prisma.group.findUnique({ where: { id: gid }, select: { creatorId: true } });
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
  if (group.creatorId === uid) return res.status(400).json({ success: false, message: 'Creator cannot leave the group' });

  const membership = await prisma.groupMember.findFirst({ where: { groupId: gid, userId: uid } });
  if (!membership) return res.status(404).json({ success: false, message: 'Not a member' });

  await prisma.groupMember.delete({ where: { id: membership.id } });
  return res.json({ success: true });
});
// POST /groups/:id/join - create a join request for current user
router.post('/:id/join', auth, async (req, res) => {
  const gid = Number(req.params.id);
  const uid = req.userId!;
  if (Number.isNaN(gid)) return res.status(400).json({ success: false, message: 'Invalid group id' });

  // Already a member?
  const member = await prisma.groupMember.findFirst({ where: { groupId: gid, userId: uid } });
  if (member) return res.json({ success: true, data: { status: 'member' } });

  // Existing request?
  const existing = await prisma.groupJoinRequest.findFirst({ where: { groupId: gid, userId: uid } });
  if (existing) return res.json({ success: true, data: existing });

  const request = await prisma.groupJoinRequest.create({
    data: { groupId: gid, userId: uid, status: 'pending' }
  });
  return res.status(201).json({ success: true, data: request });
});

// GET /groups/:id/join/status - get current user status relative to the group
router.get('/:id/join/status', auth, async (req, res) => {
  const gid = Number(req.params.id);
  const uid = req.userId!;
  if (Number.isNaN(gid)) return res.status(400).json({ success: false, message: 'Invalid group id' });

  const member = await prisma.groupMember.findFirst({ where: { groupId: gid, userId: uid } });
  if (member) return res.json({ success: true, data: { status: 'member' } });

  const jr = await prisma.groupJoinRequest.findFirst({ where: { groupId: gid, userId: uid } });
  if (jr) return res.json({ success: true, data: { status: jr.status } });
  return res.json({ success: true, data: { status: 'none' } });
});

// POST /groups/:id/requests/:userId/approve - approve a join request (creator or member can approve)
router.post('/:id/requests/:userId/approve', auth, async (req, res) => {
  const gid = Number(req.params.id);
  const targetUserId = Number(req.params.userId);
  const uid = req.userId!;
  if (Number.isNaN(gid) || Number.isNaN(targetUserId)) return res.status(400).json({ success: false, message: 'Invalid id' });

  const group = await prisma.group.findUnique({ where: { id: gid }, select: { creatorId: true } });
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
  if (group.creatorId !== uid) {
    const approverIsMember = await prisma.groupMember.findFirst({ where: { groupId: gid, userId: uid } });
    if (!approverIsMember) return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  // Ensure there is a pending request
  const reqJoin = await prisma.groupJoinRequest.findFirst({ where: { groupId: gid, userId: targetUserId } });
  if (!reqJoin) return res.status(404).json({ success: false, message: 'Join request not found' });

  // If already member, mark approved and return
  const alreadyMember = await prisma.groupMember.findFirst({ where: { groupId: gid, userId: targetUserId } });
  if (!alreadyMember) {
    await prisma.groupMember.create({ data: { groupId: gid, userId: targetUserId } });
  }
  await prisma.groupJoinRequest.update({ where: { id: reqJoin.id }, data: { status: 'approved' } });
  return res.json({ success: true, data: { status: 'approved' } });
});

// GET /groups/:id/requests?status=pending - list join requests (creator or member)
router.get('/:id/requests', auth, async (req, res) => {
  const gid = Number(req.params.id);
  const status = (req.query.status as string) || undefined;
  const uid = req.userId!;
  if (Number.isNaN(gid)) return res.status(400).json({ success: false, message: 'Invalid group id' });

  const group = await prisma.group.findUnique({ where: { id: gid }, select: { creatorId: true } });
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
  if (group.creatorId !== uid) {
    const isMember = await prisma.groupMember.findFirst({ where: { groupId: gid, userId: uid } });
    if (!isMember) return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  const where: any = { groupId: gid };
  if (status) where.status = status;
  const reqs = await prisma.groupJoinRequest.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: { id: true, status: true, createdAt: true, user: { select: { id: true, name: true, email: true } } }
  });
  return res.json({ success: true, data: reqs });
});

export default router;
// DELETE /groups/:id - only creator can delete
router.delete('/:id', auth, async (req, res) => {
  const gid = Number(req.params.id);
  const uid = req.userId!;
  if (Number.isNaN(gid)) return res.status(400).json({ success: false, message: 'Invalid group id' });

  const group = await prisma.group.findUnique({ where: { id: gid }, select: { creatorId: true } });
  if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
  if (group.creatorId !== uid) return res.status(403).json({ success: false, message: 'Only creator can delete' });

  // Clean up related records
  await prisma.message.deleteMany({ where: { groupId: gid } });
  await prisma.groupMember.deleteMany({ where: { groupId: gid } });
  await prisma.groupJoinRequest.deleteMany({ where: { groupId: gid } });
  await prisma.group.delete({ where: { id: gid } });
  return res.json({ success: true });
});
