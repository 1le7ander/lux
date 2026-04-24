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
3. **Set the shared secret** in **Project Settings → Script properties**:
   - Add a property named `ADMIN_KEY` with a strong random value.
   - Use the same value for `ADMIN_KEY` in your Next.js `.env.local`.
   - Generate one with:
     `node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))'`
   - **Never commit this value to source.** The script reads it via
     `PropertiesService.getScriptProperties()` so the file is safe to share.
4. Edit the constants at the top of `Code.gs`:
   - `DRIVE_FOLDER_ID` — your Drive folder.
   - `SHEETS_ID` — your Sheet.
   - `NOTIFY_EMAIL` — the address that receives a notification for every new
     order and every confirmation (defaults to `heamtan126@gmail.com`).
5. **Deploy → New deployment → Web app**
   - Description: `LUXE v1`
   - Execute as: **Me**
   - Who has access: **Anyone**
6. On first deploy, Google will prompt for authorization. Grant access to:
   - Google Drive (for image uploads)
   - Google Sheets (for the products/orders database)
   - **Gmail / `MailApp`** (for order notifications — the script sends email
     from the account that owns it, no SMTP password required)
7. Copy the Web App URL (`…/exec`) → paste into `APPS_SCRIPT_URL` in your
   Next.js `.env.local`.

## Email notifications

Whenever `saveOrder` appends a new order, an HTML email is sent to
`NOTIFY_EMAIL` with the customer, items, and totals. When `updateOrderStatus`
flips an order's status to `confirmed`, a second "confirmation" email is sent
to the same address. All sending uses `MailApp.sendEmail` — the Apps Script
runtime signs the mail with the owner's Google account, so no Gmail password
or SMTP server is needed. Email failures are caught and logged, never blocking
the order save.

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
