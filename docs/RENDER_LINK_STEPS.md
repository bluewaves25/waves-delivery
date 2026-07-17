# Link GitHub repo to Render (waves-delivery)

Repo: https://github.com/bluewaves25/waves-delivery

## A) Push code first (if not already on GitHub)

If `git push` asks for a password, use a **Personal Access Token** (not your GitHub password):

1. Create token: https://github.com/settings/tokens → **Generate new token (classic)** → enable `repo`
2. In PowerShell from the project folder:

```powershell
cd "C:\Users\STEVE\Downloads\Delivery-management-system-main\Delivery-management-system-main"
git push -u origin main
# Username: bluewaves25
# Password: <paste PAT>
```

Or paste the PAT here and I can push for you.

---

## B) Create & link Render (Blueprint)

1. Open https://dashboard.render.com and sign in  
2. Click **New +** → **Blueprint**  
3. Click **Connect account** / select **GitHub** if not connected  
4. Authorize Render, then choose repo **`bluewaves25/waves-delivery`**  
5. Render reads `render.yaml` and shows services:
   - `dpdms-api` (Nest API)
   - `dpdms-web` (Remix web)
6. Click **Apply**  
7. Wait until **dpdms-api** is Live → copy its URL (e.g. `https://dpdms-api.onrender.com`)  
8. Open **dpdms-web** → **Environment** → set:

```
API_BASE_URL=https://YOUR-dpdms-api.onrender.com
```

9. **Manual Deploy** the web service  
10. Optional (API Shell):

```bash
npm run seed
npm run reseed:ghana
```

---

## C) Test

- Web: `https://dpdms-web.onrender.com`  
- Track: `https://dpdms-web.onrender.com/track/DEMO-TRACK-001`  
- Free tier sleeps after idle (~15 min); first load can be slow
