import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

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
    req.userId = payload.userId;
    return next();
  } catch {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}
