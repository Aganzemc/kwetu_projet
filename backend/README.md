# Kwetu Backend

Serveur API (Node.js/TypeScript) utilisé par l'application Kwetu.

## Prérequis

- Node.js 18+
- npm 9+

## Installation

```bash
npm install
```

## Configuration (variables d'environnement)

Créez un fichier `.env` à la racine du dossier `backend/` (même niveau que `package.json`). Exemple:

```
# Port HTTP du serveur
PORT=4000

# Clé JWT pour signer les tokens
JWT_SECRET=change-me-in-prod

# (Optionnel) Connexion base de données
# DATABASE_URL=postgres://user:pass@localhost:5432/kwetu
# ou SQLite, etc. selon votre implémentation

# (Optionnel) CORS
# CORS_ORIGIN=http://localhost:5173
```

- Le frontend pointe par défaut sur `http://localhost:4000` si `VITE_API_URL` n'est pas défini.
- Assurez-vous que `CORS_ORIGIN` autorise l'URL du front (ex: `http://localhost:5173`).

## Démarrer en développement

```bash
npm run dev
```

- Démarre le serveur avec `ts-node-dev` (reload à chaud).
- URL par défaut: `http://localhost:4000`

## Build & exécution en production

```bash
npm run build
node dist/src/server.js
```

## Endpoints principaux

Les chemins ci-dessous sont déduits du frontend (`src/lib/api.ts`). Tous les endpoints protégés requièrent un header `Authorization: Bearer <token>`.

### Authentification
- `POST /auth/signup` — Inscription `{ name?, email, password, firstName?, lastName? }`
- `POST /auth/login` — Connexion `{ email, password }` → retourne `{ token, user }`

### Profils
- `GET /profiles/me` — Obtenir le profil courant
- `PATCH /profiles/me` — Mettre à jour le profil courant (ex: `{ is_online: true }`)
- `GET /profiles` — Lister les profils

### Utilisateurs
- `GET /users` — Lister
- `GET /users/:id` — Détail
- `DELETE /users/:id` — Supprimer

### Groupes
- `GET /groups` — Lister les groupes
- `POST /groups` — Créer un groupe `{ name }`
- `GET /groups/:id/members` — Lister les membres
- `POST /groups/:id/members` — Ajouter un membre `{ userId }`
- `DELETE /groups/:id` — Supprimer un groupe
- `POST /groups/:id/leave` — Quitter le groupe

### Conversations (optionnel)
- `GET /conversations` — Liste des conversations (si implémenté). Le front peut tomber en repli si non présent.

### Messages
- `GET /messages?peerId=<id>` — Messages privés
- `GET /messages?groupId=<id>` — Messages d'un groupe
- `POST /messages` — Envoyer un message `{ content, recipientId? | groupId? }`
- `PATCH /messages/:id/read` — Marquer comme lu

### Upload de fichiers
- `POST /uploads` — Upload multipart/form-data, champ `file` → retourne `{ url }` exploitable côté front

## Authentification

- Le front stocke le token JWT dans `localStorage`.
- Toutes les requêtes incluent automatiquement `Authorization: Bearer <token>` via `src/lib/api.ts`.

## CORS

- Autorisez l'origine du front dans la config CORS (ex: `http://localhost:5173`).

## Dépannage

- 403 (Forbidden) sur `/messages?groupId=...` ou `/groups/:id/members`:
  - L'utilisateur n'est probablement pas membre du groupe ou le serveur refuse l'accès.
  - Vérifiez le token et l'appartenance au groupe.
- 404 sur `/conversations`:
  - Endpoint non implémenté. Le front possède un fallback mais l'implémenter est recommandé pour de meilleures performances.

## Scripts npm (rappel)

- `npm run dev` — démarrage en développement (ts-node-dev)
- `npm run build` — transpilation TypeScript → `dist/`
