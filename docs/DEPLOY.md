# Deploy guide — Vercel vs Render

## Short answer

| Platform | Use for this project? | Why |
|---|---|---|
| **Render (recommended)** | **Yes — full app** | Runs NestJS as a real Node server, persistent disk for SQLite, WebSockets OK |
| **Vercel** | **Not for the full stack** | Fine for static/Remix UI later. **Bad** for Nest + Socket.IO + rider GPS realtime (serverless, no long-lived WS, no SQLite disk) |

**Create a Render account now:** https://dashboard.render.com/register  
(GitHub login is easiest.)

Do **not** put the Nest API on Vercel for this app.

---

## What was prepared in this repo

- `render.yaml` — Blueprint for **dpdms-api** + **dpdms-web**
- Backend `npm run build` / `npm run render:start` (migrate + start)
- Frontend production build + `render:start`
- This guide: `docs/DEPLOY.md`

---

## Deploy on Render (do this)

### 1. Accounts
1. Create **GitHub** account (if needed) and push this project to a new repo  
2. Create **Render** account: https://dashboard.render.com/register  
3. In Render: **New → Blueprint** → select your GitHub repo → Apply `render.yaml`

### 2. After first deploy
1. Copy the **dpdms-api** public URL (e.g. `https://dpdms-api.onrender.com`)
2. On **dpdms-web** → Environment → set:
   ```
   API_BASE_URL=https://YOUR-dpdms-api.onrender.com
   ```
   (no trailing slash), then **Manual Deploy** the web service
3. Open the **dpdms-web** URL in your browser
4. In Render **Shell** for `dpdms-api`, seed once:
   ```bash
   npm run seed
   node scripts/ensure-demo-parcel.js
   ```

### 3. Free-tier notes
- Free services **sleep** after idle ~15 minutes (first request can take 30–60s)
- SQLite lives on the Render **disk** at `/var/data/prod.db`
- For Ghana production later: move to **MySQL/Postgres + Redis** on a paid plan or DigitalOcean

---

## If you still want Vercel later

Only after API is on Render, and only for the **frontend**:

1. Vercel project → root directory `frontend`  
2. Env: `API_BASE_URL=https://YOUR-dpdms-api.onrender.com`  
3. Env: `SESSION_SECRET=<long random string>`  

Remix on Vercel may need a Vercel adapter upgrade; **Render hosting both is simpler today.**

---

## Local production build check

```bash
cd backend && npm run build
cd ../frontend && npm run build
```

Local demo remains: http://localhost:3000 (API http://localhost:8000)
