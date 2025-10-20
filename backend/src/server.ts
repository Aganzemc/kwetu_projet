// import app from './app';
// import dotenv from 'dotenv';

// dotenv.config();

// const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

// app.listen(PORT, () => {
//   console.log(`Server running on http://localhost:${PORT}`);
// });


import express from 'express';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(express.json());

// Connexion PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false } // obligatoire sur Render
});

// Exemple d'API
app.get('/', (req, res) => {
  res.send('https://backend-kwetu-code.onrender.com');
});

app.get('/users', async (req, res) => {
  const result = await pool.query('SELECT * FROM users');
  res.json(result.rows);
});

// Démarrage du serveur
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`✅ Serveur en ligne sur le port ${port}`));
