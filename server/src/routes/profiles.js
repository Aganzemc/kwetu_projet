import { Router } from 'express';
import { requireAuth } from '../lib/auth.js';
import { query } from '../lib/db.js';

const router = Router();

router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await query('select * from profiles where id=$1', [req.user.id]);
  res.json(rows[0] || null);
});

router.patch('/me', requireAuth, async (req, res) => {
  const fields = [
    'first_name', 'last_name', 'avatar_url', 'is_online',
    'date_of_birth', 'username', 'bio', 'address', 'city', 'country',
    'province', 'avenue', 'phone', 'profile_photo_url', 'cover_photo_url'
  ];
  const updates = [];
  const params = [];
  let idx = 1;
  for (const f of fields) {
    if (f in req.body) {
      updates.push(`${f}=$${idx++}`);
      params.push(req.body[f]);
    }
  }
  if (updates.length === 0) return res.json({ ok: true });
  params.push(req.user.id);
  const sql = `update profiles set ${updates.join(', ')}, last_seen=now() where id=$${idx} returning *`;
  const { rows } = await query(sql, params);
  res.json(rows[0]);
});

router.get('/', requireAuth, async (_req, res) => {
  const { rows } = await query('select id, first_name, last_name, avatar_url, is_online, last_seen from profiles order by first_name nulls last', []);
  res.json(rows);
});

export default router;


