import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';

export function auth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Missing or invalid Authorization header' });
  }
  const token = authHeader.substring('Bearer '.length);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ success: false, message: 'Server misconfiguration (JWT secret missing)' });
  }

  try {
    const payload = jwt.verify(token, secret) as { userId: number };
    (req as any).userId = payload.userId;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const userId = (req as any).userId as number | undefined;
  if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });
  try {
    const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true, isActive: true, deletedAt: true } });
    if (!user || user.deletedAt || !user.isActive || user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    return next();
  } catch {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
