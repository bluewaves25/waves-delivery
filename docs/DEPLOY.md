# Deploy guide — Render (SendGH)

## Live services

| Service | URL | Notes |
|---|---|---|
| Web | https://dpdms-web.onrender.com | Remix frontend |
| API | https://dpdms-api.onrender.com | NestJS + SQLite |

Repo: https://github.com/bluewaves25/waves-delivery  

Full test checklist: [TESTING.md](./TESTING.md)

---

## Why Render (not Vercel for the API)

| Platform | Use? | Why |
|---|---|---|
| **Render** | **Yes — full app** | NestJS Node server, SQLite, WebSockets OK |
| **Vercel** | UI only (optional) | Bad for Nest + Socket.IO + SQLite disk |

---

## What’s in the repo

- `render.yaml` — Blueprint for **dpdms-api** + **dpdms-web**
- Backend `npm run build` / `npm run render:start` (migrate + auto-seed if empty + start)
- Frontend production build + `render:start`

---

## Deploy / update

1. Push to `main` on GitHub — Render auto-deploys linked services.  
2. Confirm **dpdms-web** env has:
   ```
   API_BASE_URL=https://dpdms-api.onrender.com
   SESSION_SECRET=<long random string>
   ```
   (no trailing slash on API URL)
3. Wait until both services show **Live**, then follow [TESTING.md](./TESTING.md).

### First-boot seeding

`backend/scripts/render-bootstrap.js` runs on API start:

1. `prisma migrate deploy`
2. If users/areas/shops missing → Ghana location seed + user seed + demo parcel
3. `node dist/main`

Manual reseed (Render Shell, if available on your plan):

```bash
npm run seed
node scripts/ensure-demo-parcel.js
```

### Free-tier notes

- Services **sleep** after ~15 minutes idle (cold start 30–60s)
- Without a **persistent disk**, SQLite under `file:./prod.db` can reset on redeploy
- For production: attach disk (`DATABASE_URL=file:/var/data/prod.db`) or move to Postgres + Redis

---

## Local production build check

```bash
cd backend && npm run build
cd ../frontend && npm run build
```

Local demo: http://localhost:3000 (API http://localhost:8000)
