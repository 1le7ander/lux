/**
 * LUXE — Google Apps Script web app
 *
 * Acts as the sole backend for:
 *   • Uploading product images to a Google Drive folder
 *   • Persisting products & orders in a Google Sheet
 *
 * Deploy:
 *   Extensions → Apps Script → paste this file → Deploy → Web app
 *   (Execute as: me, Who has access: Anyone)
 *
 * All mutating requests must include { key: <ADMIN_KEY> } — this is the
 * shared secret stored in Script Properties (see README).
 */

// ───────────────────────── CONFIG ─────────────────────────
// The shared secret is stored in Script Properties, NOT in source, so it is
// never committed to git. Set it once in the Apps Script UI:
//   Project Settings → Script properties → add "ADMIN_KEY" = <same value as
//   ADMIN_KEY in your Next.js .env.local>
function _key() {
  return PropertiesService.getScriptProperties().getProperty('ADMIN_KEY') || '';
}

const DRIVE_FOLDER_ID  = '1viIogXrZm2dpdf3kKO-ohrO_2Ejsgss6';
const SHEETS_ID        = '1mkPF4ObtuS3wmjLjmG5UE18lq6dpW_1LWuT15r08dM0';
const PRODUCTS_SHEET   = 'products';
const ORDERS_SHEET     = 'orders';

// Store owner — receives an email for every new order and every confirmation.
const NOTIFY_EMAIL     = 'heamtan126@gmail.com';
const STORE_NAME       = 'LUXE';

// ──────────────────────── ENTRY POINTS ─────────────────────
function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'ping';
  return _route(action, e.parameter || {});
}

function doPost(e) {
  let body = {};
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return _json({ success: false, error: 'Invalid JSON body' });
  }
  return _route(body.action || 'ping', body);
}

function _route(action, body) {
  try {
    switch (action) {
      case 'ping':          return _json({ success: true, message: 'pong', time: new Date().toISOString() });
      case 'uploadImage':   return _requireKey(body) || _json(uploadToDrive(body.filename, body.base64));
      case 'listProducts':  return _json({ success: true, items: listProducts() });
      case 'saveProduct':   return _requireKey(body) || _json(saveProduct(body.product));
      case 'deleteProduct': return _requireKey(body) || _json(deleteProduct(body.id));
      case 'listOrders':    return _requireKey(body) || _json({ success: true, items: listOrders() });
      case 'saveOrder':     return _json(saveOrder(body.order));
      case 'updateOrderStatus':
                            return _requireKey(body) || _json(updateOrderStatus(body.id, body.status));
      default:              return _json({ success: false, error: 'Unknown action: ' + action });
    }
  } catch (err) {
    return _json({ success: false, error: String(err && err.message || err) });
  }
}

function _requireKey(body) {
  const expected = _key();
  if (!expected) return _json({ success: false, error: 'Server misconfigured: ADMIN_KEY script property not set' });
  if (body && body.key === expected) return null;
  return _json({ success: false, error: 'Unauthorized' });
}

function _json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ───────────────────── IMAGE UPLOAD ────────────────────────
/**
 * Receives a base64 data-URL (or raw base64), stores it in the configured
 * Drive folder, makes the file publicly viewable, and returns a direct URL
 * that can be used in <img src>.
 */
function uploadToDrive(filename, base64) {
  try {
    if (!base64) throw new Error('No image data');
    if (!filename) filename = 'luxe-' + Date.now() + '.jpg';

    const folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);

    let contentType = 'image/jpeg';
    let rawData = base64;

    if (base64.indexOf(',') !== -1) {
      const parts  = base64.split(',');
      const header = parts[0];
      rawData = parts[1];

      const match = header.match(/data:(.*);base64/);
      if (match) contentType = match[1];
    }

    const bytes = Utilities.base64Decode(rawData);
    const blob  = Utilities.newBlob(bytes, contentType, filename);

    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const fileId = file.getId();
    // Direct-view URL (works in <img src="…">, unlike the /folders/ link)
    const url = 'https://drive.google.com/uc?export=view&id=' + fileId;

    return { success: true, url: url, fileId: fileId };
  } catch (err) {
    return { success: false, error: 'Upload failed: ' + (err && err.message || err) };
  }
}

// ───────────────────── PRODUCTS ────────────────────────────
function _productSheet() {
  const ss = SpreadsheetApp.openById(SHEETS_ID);
  let sh = ss.getSheetByName(PRODUCTS_SHEET);
  if (!sh) {
    sh = ss.insertSheet(PRODUCTS_SHEET);
    sh.appendRow(['id', 'title', 'category', 'price', 'oldPrice', 'image', 'gallery', 'description', 'stock', 'createdAt']);
  }
  return sh;
}

function listProducts() {
  const sh = _productSheet();
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values.shift();
  return values.map(row => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = row[i]));
    try { obj.gallery = obj.gallery ? JSON.parse(obj.gallery) : []; } catch (e) { obj.gallery = []; }
    return obj;
  });
}

function saveProduct(p) {
  if (!p || !p.id || !p.title) return { success: false, error: 'Missing product fields' };
  if (!p.image) return { success: false, error: 'Image URL required' };
  const sh = _productSheet();
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const idIdx = headers.indexOf('id');
  const row = [
    p.id,
    p.title,
    p.category || '',
    Number(p.price) || 0,
    Number(p.oldPrice) || '',
    p.image,
    JSON.stringify(p.gallery || []),
    p.description || '',
    Number(p.stock) || 0,
    p.createdAt || new Date().toISOString(),
  ];
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIdx]) === String(p.id)) {
      sh.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return { success: true, updated: true, product: p };
    }
  }
  sh.appendRow(row);
  return { success: true, created: true, product: p };
}

function deleteProduct(id) {
  if (!id) return { success: false, error: 'Missing id' };
  const sh = _productSheet();
  const values = sh.getDataRange().getValues();
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(id)) {
      sh.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false, error: 'Product not found' };
}

// ───────────────────── ORDERS ──────────────────────────────
function _ordersSheet() {
  const ss = SpreadsheetApp.openById(SHEETS_ID);
  let sh = ss.getSheetByName(ORDERS_SHEET);
  if (!sh) {
    sh = ss.insertSheet(ORDERS_SHEET);
    sh.appendRow(['id', 'createdAt', 'status', 'name', 'phone', 'wilaya', 'commune', 'notes', 'items', 'subtotal', 'shipping', 'total']);
  }
  return sh;
}

function listOrders() {
  const sh = _ordersSheet();
  const values = sh.getDataRange().getValues();
  if (values.length < 2) return [];
  const headers = values.shift();
  return values.map(row => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = row[i]));
    try { obj.items = obj.items ? JSON.parse(obj.items) : []; } catch (e) { obj.items = []; }
    return obj;
  });
}

function saveOrder(o) {
  if (!o || !o.id || !o.customer) return { success: false, error: 'Invalid order' };
  const sh = _ordersSheet();
  const createdAt = o.createdAt || new Date().toISOString();
  const status = o.status || 'new';
  sh.appendRow([
    o.id,
    createdAt,
    status,
    o.customer.name || '',
    o.customer.phone || '',
    o.customer.wilaya || '',
    o.customer.commune || '',
    o.customer.notes || '',
    JSON.stringify(o.items || []),
    Number(o.subtotal) || 0,
    Number(o.shipping) || 0,
    Number(o.total) || 0,
  ]);

  // Best-effort self-notification. Never let email failures break the order save.
  try {
    _sendOrderEmail({ ...o, createdAt: createdAt, status: status }, 'new');
  } catch (err) {
    Logger.log('Email notification failed: ' + err);
  }

  return { success: true, order: o };
}

function updateOrderStatus(id, status) {
  if (!id || !status) return { success: false, error: 'Missing id or status' };
  const sh = _ordersSheet();
  const values = sh.getDataRange().getValues();
  const headers = values[0];
  const idIdx = headers.indexOf('id');
  const statusIdx = headers.indexOf('status');
  for (let i = 1; i < values.length; i++) {
    if (String(values[i][idIdx]) === String(id)) {
      sh.getRange(i + 1, statusIdx + 1).setValue(status);

      // When the status flips to "confirmed", send a confirmation email.
      if (String(status).toLowerCase() === 'confirmed') {
        try {
          const order = _rowToOrder(headers, values[i]);
          order.status = status;
          _sendOrderEmail(order, 'confirmed');
        } catch (err) {
          Logger.log('Confirmation email failed: ' + err);
        }
      }

      return { success: true };
    }
  }
  return { success: false, error: 'Order not found' };
}

// ───────────────────── EMAIL NOTIFICATIONS ─────────────────
function _rowToOrder(headers, row) {
  const o = {};
  headers.forEach((h, i) => (o[h] = row[i]));
  let items = [];
  try { items = o.items ? JSON.parse(o.items) : []; } catch (e) { items = []; }
  return {
    id: o.id,
    createdAt: o.createdAt,
    status: o.status,
    customer: {
      name: o.name,
      phone: o.phone,
      wilaya: o.wilaya,
      commune: o.commune,
      notes: o.notes,
    },
    items: items,
    subtotal: Number(o.subtotal) || 0,
    shipping: Number(o.shipping) || 0,
    total: Number(o.total) || 0,
  };
}

function _fmtDZD(n) {
  return (Number(n) || 0).toLocaleString('en-US') + ' DZD';
}

function _esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/**
 * Sends a self-notification email to NOTIFY_EMAIL for each new order and each
 * confirmation. Uses MailApp.sendEmail which runs from the Apps Script owner's
 * account — no SMTP credentials are needed.
 */
function _sendOrderEmail(order, kind) {
  if (!NOTIFY_EMAIL) return;
  const c = order.customer || {};
  const items = Array.isArray(order.items) ? order.items : [];

  const isConfirmed = kind === 'confirmed';
  const subject = isConfirmed
    ? ('[' + STORE_NAME + '] تأكيد طلب #' + order.id + ' — ' + _fmtDZD(order.total))
    : ('[' + STORE_NAME + '] طلب جديد #' + order.id + ' — ' + _fmtDZD(order.total));

  const rows = items.map(function (it) {
    return '<tr>'
      + '<td style="padding:8px;border-bottom:1px solid #eee">' + _esc(it.title || '') + '</td>'
      + '<td style="padding:8px;border-bottom:1px solid #eee;text-align:center">' + (Number(it.qty) || 1) + '</td>'
      + '<td style="padding:8px;border-bottom:1px solid #eee;text-align:right">' + _fmtDZD(it.price) + '</td>'
      + '</tr>';
  }).join('');

  const banner = isConfirmed ? '#059669' : '#7c3aed';
  const title  = isConfirmed ? 'تم تأكيد الطلب ✅' : 'طلب جديد 🛒';

  const html = ''
    + '<div dir="rtl" style="font-family:\'Segoe UI\',Tahoma,sans-serif;max-width:640px;margin:0 auto;background:#fafafa;padding:24px">'
    +   '<div style="background:' + banner + ';color:#fff;padding:20px 24px;border-radius:12px 12px 0 0">'
    +     '<h1 style="margin:0;font-size:22px">' + title + '</h1>'
    +     '<p style="margin:6px 0 0;font-size:14px;opacity:.9">' + STORE_NAME + ' — ' + _esc(order.id) + '</p>'
    +   '</div>'
    +   '<div style="background:#fff;padding:24px;border-radius:0 0 12px 12px;border:1px solid #eee;border-top:0">'
    +     '<h2 style="margin:0 0 12px;font-size:16px;color:#111">بيانات العميل</h2>'
    +     '<p style="margin:4px 0;font-size:14px"><b>الاسم:</b> ' + _esc(c.name) + '</p>'
    +     '<p style="margin:4px 0;font-size:14px"><b>الهاتف:</b> ' + _esc(c.phone) + '</p>'
    +     '<p style="margin:4px 0;font-size:14px"><b>الولاية:</b> ' + _esc(c.wilaya) + '</p>'
    +     '<p style="margin:4px 0;font-size:14px"><b>البلدية:</b> ' + _esc(c.commune) + '</p>'
    +     (c.notes ? '<p style="margin:4px 0;font-size:14px"><b>ملاحظات:</b> ' + _esc(c.notes) + '</p>' : '')
    +     '<h2 style="margin:20px 0 12px;font-size:16px;color:#111">المنتجات</h2>'
    +     '<table style="width:100%;border-collapse:collapse;font-size:14px">'
    +       '<thead><tr style="background:#f5f5f5">'
    +         '<th style="padding:8px;text-align:right">المنتج</th>'
    +         '<th style="padding:8px;text-align:center">الكمية</th>'
    +         '<th style="padding:8px;text-align:right">السعر</th>'
    +       '</tr></thead>'
    +       '<tbody>' + rows + '</tbody>'
    +     '</table>'
    +     '<div style="margin-top:20px;padding-top:16px;border-top:2px solid #eee;font-size:14px">'
    +       '<p style="margin:4px 0"><b>المجموع الفرعي:</b> ' + _fmtDZD(order.subtotal) + '</p>'
    +       '<p style="margin:4px 0"><b>الشحن:</b> ' + _fmtDZD(order.shipping) + '</p>'
    +       '<p style="margin:8px 0 0;font-size:18px;color:' + banner + '"><b>المجموع: ' + _fmtDZD(order.total) + '</b></p>'
    +     '</div>'
    +     '<p style="margin-top:24px;color:#666;font-size:12px;text-align:center">'
    +       _esc(order.createdAt) + ' • ' + STORE_NAME
    +     '</p>'
    +   '</div>'
    + '</div>';

  MailApp.sendEmail({
    to: NOTIFY_EMAIL,
    subject: subject,
    htmlBody: html,
    name: STORE_NAME + ' Notifications',
  });
}
