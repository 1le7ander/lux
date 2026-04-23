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
 * All mutating requests must include { key: KEY } — this is the shared
 * secret that matches ADMIN_KEY in the Next.js .env.local.
 */

// ───────────────────────── CONFIG ─────────────────────────
const KEY              = 'agency2025admin';
const DRIVE_FOLDER_ID  = '1viIogXrZm2dpdf3kKO-ohrO_2Ejsgss6';
const SHEETS_ID        = '1mkPF4ObtuS3wmjLjmG5UE18lq6dpW_1LWuT15r08dM0';
const PRODUCTS_SHEET   = 'products';
const ORDERS_SHEET     = 'orders';

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
  if (body && body.key === KEY) return null;
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
  sh.appendRow([
    o.id,
    o.createdAt || new Date().toISOString(),
    o.status || 'new',
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
      return { success: true };
    }
  }
  return { success: false, error: 'Order not found' };
}
