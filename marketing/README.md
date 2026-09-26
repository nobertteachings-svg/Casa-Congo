# Casa Congo — marketing site

Live stats and listing carousel need the backend public API (`/api/public/*`).

**Production domain:** [casahomesdrcongo.com](https://casahomesdrcongo.com)  
**Custom domain steps:** [Docs/DOMAIN_SETUP.md](../Docs/DOMAIN_SETUP.md)

## Brand assets

Regenerate feature graphic, OG image, lockup, and icons from the master mark:

```bash
.venv-brand/bin/python scripts/generate_brand_assets.py
```

## Environment variables

Set on Railway **casa-marketing** (build-time for `VITE_*`):

```env
VITE_WHATSAPP_PHONE=243862768917
VITE_API_URL=https://api.casahomesdrcongo.com
VITE_CONTACT_EMAIL=hello@casahomesdrcongo.com
VITE_IOS_APP_URL=https://apps.apple.com/cd/search?term=Casa%20Congo
VITE_ANDROID_APP_URL=https://play.google.com/store/apps/details?id=com.casahomesrdc.app
```

On **casa-backend**, set CORS:

```env
MARKETING_ORIGIN=https://casahomesdrcongo.com,https://www.casahomesdrcongo.com
```

Full Railway steps: [Docs/MARKETING_RAILWAY.md](../Docs/MARKETING_RAILWAY.md)

## Local dev

```bash
cd marketing
npm install
npm run dev
```

Open http://localhost:5174 (proxies `/api` to `localhost:3000` when backend is running).

## Deploy on Railway

1. New service in your existing Casa Congo Railway project
2. **Root Directory:** `marketing`
3. **Config file:** `/marketing/railway.toml`
4. Add `VITE_*` variables above
5. Generate a Railway domain, then attach **casahomesdrcongo.com** / **www** — see [DOMAIN_SETUP.md](../Docs/DOMAIN_SETUP.md)
6. Set `MARKETING_ORIGIN` on the backend

## Deploy on Vercel (alternative)

1. Import repo → **Root Directory** `marketing`
2. Add `VITE_*` environment variables
3. Deploy, then point the domain at Vercel if not using Railway for marketing
