import { Router } from 'express';
import { requireAuth } from '../lib/auth.js';
import { query } from '../lib/db.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const { peerId, groupId } = req.query;
  let rows = [];
  if (peerId) {
    const { rows: r } = await query(
      `select * from messages
       where (sender_id=$1 and recipient_id=$2)
          or (sender_id=$2 and recipient_id=$1)
       order by created_at asc`,
      [req.user.id, peerId]
    );
    rows = r;
  } else if (groupId) {
    const { rows: r } = await query(
      `select * from messages where group_id=$1 order by created_at asc`,
      [groupId]
    );
    rows = r;
  }
  res.json(rows);
});

router.post('/', requireAuth, async (req, res) => {
  const { recipient_id, group_id, content, message_type, file_url, file_name, file_type } = req.body || {};
  const { rows } = await query(
    `insert into messages (sender_id, recipient_id, group_id, content, message_type, file_url, file_name, file_type)
     values ($1,$2,$3,$4,$5,$6,$7,$8) returning *`,
    [req.user.id, recipient_id || null, group_id || null, content || '', message_type || 'text', file_url || null, file_name || null, file_type || null]
  );
  res.json(rows[0]);
});

export default router;


