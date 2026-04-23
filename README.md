# LUXE — متجر الأزياء الفاخر في الجزائر

> Next.js 14 + TypeScript + TailwindCSS + Google Apps Script (Drive + Sheets backend)

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        Next.js App (src/)                      │
│   app/         pages (home, shop, product, checkout, admin)    │
│   components/  UI split by domain (site, shop, product, …)     │
│   stores/      Zustand cart store (persisted to localStorage)  │
│   lib/         pure helpers (format, wilayas, apps-script ws)  │
│   server/      server-only code (auth, upload adapter)         │
│   app/api/     REST endpoints (orders, products, admin/upload) │
└────────────────────────────────────────────────────────────────┘
                           │ HTTPS (signed with ADMIN_KEY)
                           ▼
┌────────────────────────────────────────────────────────────────┐
│              google-apps-script/Code.gs (Web App)              │
│   • uploadToDrive(filename, base64)  → { success, url }        │
│   • saveProduct / listProducts       → Google Sheets           │
│   • saveOrder    / listOrders        → Google Sheets           │
└────────────────────────────────────────────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                             ▼
     Google Drive folder           Google Sheet (db)
     (product images)              (products + orders)
```

## Setup

```bash
cp .env.example .env.local
# fill in APPS_SCRIPT_URL, ADMIN_PASS_HASH, etc.
npm install
npm run dev
```

Open http://localhost:3000.

## Google Apps Script deployment

1. Open https://script.google.com and create a new project.
2. Paste the contents of [`google-apps-script/Code.gs`](./google-apps-script/Code.gs).
3. Update `DRIVE_FOLDER_ID` and `SHEETS_ID` at the top of the file.
4. Make sure `KEY` matches `ADMIN_KEY` in `.env.local`.
5. Deploy → **New deployment** → Type: **Web app** → Execute as: **Me** → Who has access: **Anyone**.
6. Copy the `/exec` URL into `APPS_SCRIPT_URL` in `.env.local`.

See [`google-apps-script/README.md`](./google-apps-script/README.md) for details.

## Scripts

| command            | what it does                                     |
|--------------------|--------------------------------------------------|
| `npm run dev`      | start the Next.js dev server on :3000            |
| `npm run build`    | production build                                 |
| `npm run start`    | serve the production build                       |
| `npm run lint`     | run `next lint` + custom project lint rules      |
| `npm run smoke`    | post-build smoke test (routes return 200)        |
| `npm run typecheck`| strict TypeScript check                          |

## Project layout

Mirrors the screenshot in the brief 1:1:

- `data/products.json` — seed product catalog
- `google-apps-script/` — the Drive + Sheets backend
- `parts/` — design-system fragments (reserved)
- `public/` — static assets
- `scripts/` — lint and smoke-test utilities
- `src/app/` — App Router pages + API routes
- `src/components/{admin,cart,checkout,product,shop,site}/` — UI
- `src/lib/` — shared helpers
- `src/orders/`, `src/products/` — domain types + Zod schemas
- `src/server/` — server-only code
- `src/stores/cart-store.ts` — Zustand cart
- `_legacy/` — the original single-file build (kept for reference, git-ignored)
