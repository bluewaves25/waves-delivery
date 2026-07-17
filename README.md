# SendGH — Delivery across Ghana

Nationwide pickup and delivery platform (NestJS API + Remix web + Expo rider app).

## Live demo

| Service | URL |
|---|---|
| **Web** | https://dpdms-web.onrender.com |
| **API** | https://dpdms-api.onrender.com |
| **Repo** | https://github.com/bluewaves25/waves-delivery |

> Free Render services sleep after ~15 minutes idle. First load can take 30–60s.

## Demo credentials

Password for **all** accounts: `123456`

| Role | Email | Login URL |
|---|---|---|
| Merchant (book parcels) | `maruffamd@gmail.com` | [/login](https://dpdms-web.onrender.com/login) |
| Admin | `admin@gmail.com` | [/admin/login](https://dpdms-web.onrender.com/admin/login) |
| Pickup rider | `reyad@gmail.com` | [/packagehandler/login](https://dpdms-web.onrender.com/packagehandler/login) |
| Delivery rider | `tushar@gmail.com` | [/packagehandler/login](https://dpdms-web.onrender.com/packagehandler/login) |
| Public tracking | parcel `DEMO-TRACK-001` | [/track/DEMO-TRACK-001](https://dpdms-web.onrender.com/track/DEMO-TRACK-001) |

Full click-through checklist: **[docs/TESTING.md](docs/TESTING.md)**  
Who pays whom: **[docs/HOW_MONEY_WORKS.md](docs/HOW_MONEY_WORKS.md)**  
Deploy notes: **[docs/DEPLOY.md](docs/DEPLOY.md)**

## What visitors can do

1. **Track** — no account; enter parcel number / tracking token  
2. **Book a delivery** — public form at `/book` (no signup); get a tracking link  
3. **Merchant account** (optional) — dashboard for shops that send often  
4. **Staff** — admin and rider panels at `/admin` and `/packagehandler`

## Getting started (local)

### Prerequisites

- [Node.js](https://nodejs.org) v18 or v20  

> Local setup uses **SQLite** (`backend/prisma/dev.db`). No MySQL/Docker required.

### Install

```sh
npm run setup
```

### Environment

**backend/.env**

```
PORT=8000
DATABASE_URL="file:./dev.db"
JWT_SECRET=ANYTHING_YOU_LIKE
BCRYPT_SALT_OR_ROUNDS=10
```

**frontend/.env**

```
SESSION_SECRET=dearMj
API_BASE_URL=http://localhost:8000
```

### Database

```sh
npm run prisma:migrate
cd backend && npm run seed
# optional demo parcel:
node scripts/ensure-demo-parcel.js
```

### Run

```sh
npm start
```

- API: http://localhost:8000  
- Web: http://localhost:3000  

## Built with

- [NestJS](https://nestjs.com/) · [Prisma](https://www.prisma.io/) · [Remix](https://remix.run/) · [Chakra UI](https://chakra-ui.com/) · [Tailwind CSS](https://tailwindcss.com/) · Expo (rider app under `mobile/`)

## Authors

- Original: **Md Maruf Ahmed**
- Ghana localization / SendGH deploy: **bluewaves25**
