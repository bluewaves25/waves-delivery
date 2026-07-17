# SendGH — test everything

Use this checklist against the live demo or local stack.

| | URL |
|---|---|
| Web | https://dpdms-web.onrender.com |
| API | https://dpdms-api.onrender.com |
| Local web | http://localhost:3000 |
| Local API | http://localhost:8000 |

**Password for all seeded users:** `123456`

---

## 0. Warm-up (Render free tier)

1. Open the web URL once and wait if it spins (cold start 30–60s).  
2. Optional API ping: open `https://dpdms-api.onrender.com` — expect a JSON hello.  
3. Confirm Ghana areas: `https://dpdms-api.onrender.com/service-area/tree` — should list divisions (e.g. Greater Accra).

---

## 1. Public site (no login)

| # | Action | Expected |
|---|---|---|
| 1.1 | Open `/` | SendGH hero with **Track a parcel** and **Book a delivery** |
| 1.2 | Nav shows Track · Book delivery · Log in · Sign up | Links work on desktop and mobile menu |
| 1.3 | Footer has the same four links | |
| 1.4 | Demo access box lists merchant / admin / riders / track | Credentials visible on home |
| 1.5 | Click **Track a parcel** → `/track/lookup` | Track form + SendGH header |
| 1.6 | Track `DEMO-TRACK-001` | Parcel status, address, timeline load |
| 1.7 | Or open `/track/DEMO-TRACK-001` directly | Same result |
| 1.8 | Click **Book a delivery** → `/book` | Guest form (no signup required) |

---

## 1b. Guest book (no account)

| # | Action | Expected |
|---|---|---|
| 1b.1 | Open `/book` | Form: From you / To customer / Package + live charge |
| 1b.2 | Fill pickup + delivery areas (Ghana), phones, addresses, weight | Estimate updates when delivery area + weight set |
| 1b.3 | Submit **Book delivery** | Redirect to `/track/<token>` with new parcel |
| 1b.4 | Note parcel number on track page | Can re-track later with that number |
| 1b.5 | Optional COD amount | Charge includes 1% COD fee |

API check:

```bash
# Pick real area IDs from /service-area/tree first
curl -X POST https://dpdms-api.onrender.com/parcels/guest \
  -H "Content-Type: application/json" \
  -d "{\"senderName\":\"Kwame\",\"senderPhone\":\"0244111000\",\"senderAddress\":\"Osu\",\"senderAreaId\":1,\"customerName\":\"Ama\",\"customerPhone\":\"0200222000\",\"customerAddress\":\"East Legon\",\"parcelDeliveryAreaId\":2,\"parcelWeight\":500,\"parcelCashCollection\":0}"
```

---

## 2. Merchant — dashboard booking (optional)

| # | Action | Expected |
|---|---|---|
| 2.1 | `/login` | Form prefilled with `maruffamd@gmail.com` / `123456` |
| 2.2 | Log in | Redirect to `/dashboard` |
| 2.3 | Nav **Book delivery** → `/create-parcel` | Create-parcel form |
| 2.4 | Create a parcel to a Ghana area | Success; parcel appears in Parcels list |
| 2.5 | Copy parcel number → open `/track/<number>` in a private window | Public track works without login |
| 2.6 | `/parcel-list` | Lists parcels |
| 2.7 | `/parcel-tracking?parcelNumber=…` | Merchant timeline view |
| 2.8 | Log out → `/register` | Can create a new shop account (optional) |

**Demo merchant:** `maruffamd@gmail.com` / `123456`

---

## 3. Admin

| # | Action | Expected |
|---|---|---|
| 3.1 | `/admin/login` | Prefills `admin@gmail.com` / `123456` |
| 3.2 | Log in | Admin dashboard |
| 3.3 | Browse merchants / parcels / areas menus | Pages load without crash |

**Demo admin:** `admin@gmail.com` / `123456`

---

## 4. Riders (package handlers)

| # | Action | Expected |
|---|---|---|
| 4.1 | `/packagehandler/login` | Prefills pickup rider; demo box shows both riders |
| 4.2 | Log in as **reyad@gmail.com** | Pickup dashboard |
| 4.3 | Log out; log in as **tushar@gmail.com** | Delivery dashboard |
| 4.4 | If parcels are assigned, update status / pick up | Status changes reflect on public track |

| Role | Email | Password |
|---|---|---|
| Pickup | `reyad@gmail.com` | `123456` |
| Delivery | `tushar@gmail.com` | `123456` |

---

## 5. API smoke (optional)

```bash
# Health
curl https://dpdms-api.onrender.com

# Areas
curl https://dpdms-api.onrender.com/service-area/tree

# Track
curl https://dpdms-api.onrender.com/track/DEMO-TRACK-001

# Admin login
curl -X POST https://dpdms-api.onrender.com/auth/admin/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"admin@gmail.com\",\"password\":\"123456\"}"

# Merchant login
curl -X POST https://dpdms-api.onrender.com/auth/merchant/login \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"maruffamd@gmail.com\",\"password\":\"123456\"}"
```

Expect HTTP 200/201 and JSON bodies (not 401/500).

---

## 6. Local reseed (if demos missing)

```sh
cd backend
npm run seed
node scripts/ensure-demo-parcel.js
```

On Render, first boot runs `npm run render:start` which migrates and seeds when the DB is empty/incomplete.

---

## Quick path map

```
Visitor ──► / ──► Track  (/track/…)           no login
         └──────► Book   (/book) ──► POST /parcels/guest ──► /track/TOKEN
                                      (optional) /register for merchant dashboard

Staff   ──► /admin/login
Rider   ──► /packagehandler/login
```

If something fails after a Render redeploy, wait for the deploy to go **Live**, then hard-refresh. SQLite on free tier may reset if no persistent disk is attached — reseed via bootstrap or Shell if demos disappear.
