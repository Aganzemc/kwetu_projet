import pg from 'pg';

let pool;

export function createPool() {
  if (pool) return pool;
  pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false
  });
  return pool;
}

export async function query(sql, params) {
  const client = await createPool().connect();
  try {
    const result = await client.query(sql, params);
    return result;
  } finally {
    client.release();
  }
}


