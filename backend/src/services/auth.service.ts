import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';

const SALT_ROUNDS = 10;

export async function registerUser(name: string, email: string, password: string) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: 'EMAIL_IN_USE' as const };
  }

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { name, email, password: hashed },
    select: { id: true, name: true, email: true, createdAt: true }
  });

  return { user };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: 'USER_NOT_FOUND' as const };
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return { error: 'INVALID_PASSWORD' as const };
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Missing JWT_SECRET');
  }

  const token = jwt.sign({ userId: user.id }, secret, { expiresIn: '7d' });

  return {
    token,
    user: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt }
  };
}
