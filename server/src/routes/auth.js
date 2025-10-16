import { Router } from 'express';
import { createToken, hashPassword, verifyPassword, getUserByEmail } from '../lib/auth.js';
import { query } from '../lib/db.js';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });

    const existing = await getUserByEmail(email);
    if (existing) return res.status(409).json({ error: 'email already exists' });

    const passHash = await hashPassword(password);
    const { rows } = await query(
      'insert into users (email, password_hash) values ($1, $2) returning id, email',
      [email, passHash]
    );

    const user = rows[0];
    await query(
      'insert into profiles (id, first_name, last_name) values ($1, $2, $3)',
      [user.id, firstName || null, lastName || null]
    );

    const token = createToken({ id: user.id, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (e) {
    res.status(500).json({ error: 'Database error saving new user', detail: e.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  const user = await getUserByEmail(email);
  if (!user) return res.status(401).json({ error: 'invalid credentials' });
  const ok = await verifyPassword(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'invalid credentials' });
  const token = createToken({ id: user.id, email: user.email });
  res.json({ token, user: { id: user.id, email: user.email } });
});

export default router;


