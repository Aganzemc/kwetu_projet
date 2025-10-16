# Kwetu Projet

## Aperçu

Backend Node.js + Express + TypeScript avec Prisma (PostgreSQL) pour une application React TypeScript.

- Authentification: inscription (hash bcrypt), connexion (JWT), profil protégé
- ORM: Prisma + PostgreSQL
- CORS + parsers JSON et x-www-form-urlencoded

Arborescence principale:
```
/backend
  src/
    controllers/
    middlewares/
    prisma/
    routes/
    services/
    types/
    app.ts
    server.ts
  prisma/schema.prisma
  .env
  tsconfig.json
  package.json
```

## Prérequis

- Node.js 18+
- PostgreSQL local (ou Docker)

## Configuration de l'environnement

Créez et complétez le fichier `backend/.env`:
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/react_auth_db?schema=public"
JWT_SECRET="change-me-in-prod"
PORT=4000
```
Remplacez `YOUR_PASSWORD` par votre mot de passe Postgres. Si le mot de passe contient des caractères spéciaux, encodez-les en URL.

## Installation (backend)

Dans le dossier `backend/`:
```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev
```
Le serveur démarre sur `http://localhost:4000`.

## Endpoints API

- Auth
  - POST `/api/auth/register` (alias: POST `/auth/signup`)
    - Body JSON: `{ "name": "John", "email": "john@example.com", "password": "secret" }`
    - Réponses:
      - 201: `{ success: true, data: { id, name, email, createdAt } }`
      - 409: `{ success: false, message: "Email already in use" }`
      - 400: `{ success: false, message: "Missing fields" }`
  - POST `/api/auth/login` (alias: POST `/auth/login`)
    - Body JSON: `{ "email": "john@example.com", "password": "secret" }`
    - Réponses:
      - 200: `{ success: true, data: { token, user } }`
      - 404/401/400 selon le cas

- Profil (protégé par JWT)
  - GET `/profiles/me`
    - Header: `Authorization: Bearer <token>`
    - 200: `{ success: true, data: { id, name, email, createdAt } }`

## Exemple d'utilisation (frontend React + Axios)

```ts
import axios from 'axios';

const API = 'http://localhost:4000';

export async function signup(name: string, email: string, password: string) {
  const res = await axios.post(`${API}/auth/signup`, { name, email, password }, {
    headers: { 'Content-Type': 'application/json' }
  });
  return res.data; // { success, data }
}

export async function login(email: string, password: string) {
  const res = await axios.post(`${API}/auth/login`, { email, password });
  const { token } = res.data.data;
  localStorage.setItem('auth_token', token);
  return res.data;
}

export async function me() {
  const token = localStorage.getItem('auth_token');
  const res = await axios.get(`${API}/profiles/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
}
```

## Dépannage

- Erreur Prisma P1000 (auth Postgres): vérifier que le service Postgres tourne et que `DATABASE_URL` est correct.
- 400 sur `/auth/signup`: vérifier `Content-Type: application/json` et que `name`, `email`, `password` sont fournis.
- 401 sur `/profiles/me`: fournir le header `Authorization: Bearer <token>` obtenu au login.

## Scripts utiles

Dans `backend/package.json`:
- `npm run dev`: démarrer le serveur de développement
- `npm run build`: compiler TypeScript vers `dist/`
- `npm start`: lancer depuis `dist/`
- `npm run prisma:generate`: `prisma generate`
- `npm run prisma:migrate`: `prisma migrate dev --name init`
- `npm run prisma:push`: `prisma db push`
- `npm run prisma:studio`: ouvrir Prisma Studio

## Licence

MIT
