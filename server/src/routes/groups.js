import { Router } from 'express';
import { requireAuth } from '../lib/auth.js';
import { query } from '../lib/db.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const { rows } = await query(
    `select g.* from groups g
     join group_members gm on gm.group_id=g.id
     where gm.user_id=$1
     order by g.created_at desc`,
    [req.user.id]
  );
  res.json(rows);
});

export default router;


