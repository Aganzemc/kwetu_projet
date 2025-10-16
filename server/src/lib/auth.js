import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { query } from './db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-in-prod';

export function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) return res.status(401).json({ error: 'Missing Authorization header' });
  const token = header.replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain, hash) {
  return await bcrypt.compare(plain, hash);
}

export async function getUserByEmail(email) {
  const { rows } = await query('select * from users where email=$1', [email]);
  return rows[0] || null;
}


