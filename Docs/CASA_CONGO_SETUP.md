# Casa Congo — Setup Guide

Casa Congo is a **separate codebase and deployment** from Casa Kenya and every other country fork.

| | Casa Kenya | Casa Congo |
|--|------------|------------|
| Directory | `Desktop/Casa Kenya` | `Desktop/Casa DR Congo` |
| GitHub | `nobertteachings-svg/Casa-Kenya` | **Own repo** (create when ready) |
| Expo | Kenya project `cd8a3e52-…` | **New Expo project** (`casa-congo`) |
| iOS | ASC `6815614395` | **New App Store app** (same Apple team) |
| Android | Kenya Play listing | **Own listing** `com.casahomesrdc.app` |
| Currency | KES | **CDF** |
| Phone | +254 | **+243** |
| Locations | 47 counties | **26 provinces** |
| Language | English | **French only** |
| WhatsApp | Kenya WABA | **+243 862 768 917** |
| Domain | casahomeskenya.com | **casahomesdrcongo.com** |
| Railway | `Casa-Kenya` | **New project** (`Casa-Congo`) |
| Local DB | `localhost:5432` | **`localhost:5434` / `casa_congo`** |

## Hard rules

1. **Never share** `DATABASE_URL`, `REDIS_URL`, WhatsApp tokens, or payment keys with Kenya or any other country.
2. Create a **new Railway project** — do not deploy DRC onto Casa-Kenya.
3. Register a **new Meta WhatsApp Business** phone number for DRC (+243).
4. Keep `PAYMENTS_ENABLED=false` until Airtel Money, Orange Money, or M-Pesa RDC is wired.
5. Reuse the same **GitHub / Expo / Apple accounts** if you want, but keep a **new** GitHub repo, Expo project, bundle id, and Play listing.

## Local development

```bash
cd "/Users/macbookpro2017/Desktop/Casa DR Congo"
cp .env.example .env
npm --prefix backend install
npm --prefix admin install
npm --prefix marketing install
npm run dev:db
npm run db:migrate
npm run dev:backend
```

## Production checklist

- [ ] New Postgres + Redis on Railway project `Casa-Congo`
- [ ] New WhatsApp number + webhook → `https://api.casahomesdrcongo.com/webhook`
- [ ] Domains: `casahomesdrcongo.com`, `www`, `api`, `admin`
- [ ] `UNLOCK_FEE_CDF` (default 500 — adjust in market; `UNLOCK_FEE_KES` still accepted as alias)
- [ ] Cloudinary cloud or folder prefix separate from KE/RW/NG/CM
- [ ] Marketing `VITE_WHATSAPP_PHONE` = `243862768917`
- [ ] New Expo project; put `extra.eas.projectId` in `mobile/app.json` after `eas init`
- [ ] New iOS app on the same Apple team (`mutaleyinguhalain@gmail.com` / `X59YSW73S8`)
- [ ] Android: EAS build AAB, then **upload manually** in Play Console
- [ ] App Review phones: `APP_REVIEW_PHONE` / `APP_REVIEW_OTP` (`243…`)

## Payments (future)

Do **not** reuse M-Pesa Kenya, Campay, or Notchpay. Prefer:

- **Airtel Money RDC**
- **Orange Money RDC**
- **M-Pesa RDC** (when available)

Until then unlocks stay free when `PAYMENTS_ENABLED=false`.

## Product defaults

- **French only** — WhatsApp, app, and website. No Lingala/Swahili UI at launch.
- Landlord ID: **carte d'identité nationale** or passport
- Electricity: SNEL prepaid / postpaid
- Housing types keep stable IDs; labels are Congolese French (studio, chambre, villa, duplex, boyerie)
