# LUXE — Google Apps Script backend

Deployment guide for `Code.gs`.

## Prerequisites

1. A Google Drive folder for product images → copy the folder ID from the URL
   (`/drive/folders/<FOLDER_ID>`). Current default:
   `1viIogXrZm2dpdf3kKO-ohrO_2Ejsgss6`
2. A Google Sheets spreadsheet for products + orders → copy the sheet ID from
   the URL (`/spreadsheets/d/<SHEETS_ID>`). Current default:
   `1mkPF4ObtuS3wmjLjmG5UE18lq6dpW_1LWuT15r08dM0`

The script will auto-create the `products` and `orders` tabs on first use.

## Deploy

1. Visit https://script.google.com and create a new project named `LUXE`.
2. Paste the contents of [`Code.gs`](./Code.gs).
3. Edit the top of the file:
   - `KEY` — shared secret (also placed in `.env.local` as `ADMIN_KEY`).
   - `DRIVE_FOLDER_ID` — your Drive folder.
   - `SHEETS_ID` — your Sheet.
4. **Deploy → New deployment → Web app**
   - Description: `LUXE v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy the Web App URL (`…/exec`) → paste into `APPS_SCRIPT_URL` in your
   Next.js `.env.local`.

## Actions

All actions accept `application/json` POST bodies and return JSON.

| action               | auth | payload                                | returns                          |
|----------------------|------|----------------------------------------|----------------------------------|
| `ping`               | —    | `{}`                                   | `{ success, message, time }`     |
| `uploadImage`        | key  | `{ filename, base64 }`                 | `{ success, url, fileId }`       |
| `listProducts`       | —    | `{}`                                   | `{ success, items }`             |
| `saveProduct`        | key  | `{ product }`                          | `{ success, created/updated }`   |
| `deleteProduct`      | key  | `{ id }`                               | `{ success }`                    |
| `listOrders`         | key  | `{}`                                   | `{ success, items }`             |
| `saveOrder`          | —    | `{ order }`                            | `{ success, order }`             |
| `updateOrderStatus`  | key  | `{ id, status }`                       | `{ success }`                    |

Actions tagged **key** require `{ key: "<ADMIN_KEY>" }` in the request body.

## Image URL shape

`uploadToDrive` returns a **direct-view** URL of the form:

```
https://drive.google.com/uc?export=view&id=<fileId>
```

That URL works in plain `<img src="...">`. Do **not** use the folder URL —
that was the bug fixed in this rewrite.

## Local testing

```bash
curl -s -X POST "$APPS_SCRIPT_URL" \
  -H "Content-Type: application/json" \
  -d '{"action":"ping"}'
# → {"success":true,"message":"pong","time":"..."}
```
