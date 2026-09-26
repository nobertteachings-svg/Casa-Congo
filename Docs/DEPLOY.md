# Deploy Casa Congo

**Primary production stack (Railway + casahomesdrcongo.com):**

| Piece | Where |
|-------|--------|
| Backend API / WhatsApp webhook | Railway → `https://api.casahomesdrcongo.com` |
| Marketing site | Railway → `https://casahomesdrcongo.com` |
| Admin dashboard | Railway → `https://admin.casahomesdrcongo.com` |
| Postgres + Redis | Railway plugins |

**Custom domain walkthrough (clicks + DNS):** [DOMAIN_SETUP.md](./DOMAIN_SETUP.md)  
**Backend first-time Railway setup:** [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)  
**Marketing service:** [MARKETING_RAILWAY.md](./MARKETING_RAILWAY.md)

> Older notes below still mention Supabase / Upstash / Vercel as alternatives. Prefer Railway + the custom domain doc for the current setup.

---

## 1. Deploy the backend (Railway)

See [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md). Summary:

1. Deploy from GitHub with `railway.toml` / `backend/Dockerfile`
2. Link Postgres + Redis
3. Set env vars from `railway.env.example`
4. Generate Railway domain, then add **`api.casahomesdrcongo.com`** ([DOMAIN_SETUP.md](./DOMAIN_SETUP.md))

### Verify backend

```bash
curl https://api.casahomesdrcongo.com/health
```

Expected: `{"status":"ok",...}`

### Set WhatsApp webhook

| Field | Value |
|-------|--------|
| **Callback URL** | `https://api.casahomesdrcongo.com/webhook` |
| **Verify token** | Same as `WHATSAPP_VERIFY_TOKEN` |

---

## 2. Deploy admin + marketing

- Admin: Railway service with root `admin/`; custom domain `admin.casahomesdrcongo.com`
- Marketing: [MARKETING_RAILWAY.md](./MARKETING_RAILWAY.md); domains `casahomesdrcongo.com` + `www`

### Env vars after domains are live

**Backend**

```env
ADMIN_ORIGIN=https://admin.casahomesdrcongo.com
MARKETING_ORIGIN=https://casahomesdrcongo.com,https://www.casahomesdrcongo.com
```

**Admin / Marketing (build-time)**

```env
VITE_API_URL=https://api.casahomesdrcongo.com
VITE_CONTACT_EMAIL=hello@casahomesdrcongo.com
```

---

## 3. Post-deploy checklist

- [ ] `GET https://api.casahomesdrcongo.com/health` returns `ok`
- [ ] WhatsApp webhook verified at `https://api.casahomesdrcongo.com/webhook`
- [ ] Marketing loads at https://casahomesdrcongo.com
- [ ] Admin login works at https://admin.casahomesdrcongo.com
- [ ] CORS origins match custom domains exactly (no trailing slash)
- [ ] Full checklist in [DOMAIN_SETUP.md](./DOMAIN_SETUP.md)

---

## 4. Local vs production

| Service | Local | Production |
|---------|-------|------------|
| Backend | `http://localhost:3000` | `https://api.casahomesdrcongo.com` |
| Admin | `http://localhost:5173` | `https://admin.casahomesdrcongo.com` |
| Marketing | `http://localhost:5174` | `https://casahomesdrcongo.com` |
| Database | Docker Postgres | Railway Postgres |
| Redis | Docker Redis | Railway Redis |

---

## 5. Troubleshooting

See [DOMAIN_SETUP.md](./DOMAIN_SETUP.md) and [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md).

**Webhook verify fails** — backend public + healthy; token matches Meta; use `api.casahomesdrcongo.com`.

**Admin / marketing CORS errors** — `ADMIN_ORIGIN` / `MARKETING_ORIGIN` must match the browser origin exactly.
