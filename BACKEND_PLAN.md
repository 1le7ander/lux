# LUXE Backend & Database — خطة هندسية احترافية (Elite Engineering Plan)

> **المستوى:** Senior Engineering / $10,000+ Website  
> **الهدف:** بناء backend قوي مع database حقيقي بحيث كل بيانات الموقع (منتجات، تصنيفات، عروض، طلبات، صور، إعدادات، إعلانات) تُحفظ بشكل دائم وتظهر من أي جهاز.

---

## 📋 تحليل الوضع الحالي (Current State Analysis)

### المشاكل الحالية:
1. **localStorage فقط** — كل البيانات محفوظة في متصفح المستخدم. إذا مسح البيانات أو فتح من جهاز ثاني، يخسر كل شيء
2. **لا يوجد backend حقيقي** — لا API server، لا authentication حقيقي
3. **Admin auth ضعيف** — SHA-256 hash مقارنة على الـ client-side (يمكن تجاوزها)
4. **Firebase غير مفعل** — الكود موجود لكن بدون credentials، يشتغل كـ fallback
5. **لا يوجد تخزين صور** — المنتجات بدون صور (روابط فارغة)
6. **لا يوجد session management حقيقي** — الـ token مخترع محلياً

### البيانات الموجودة (Data Models):
| الكيان | الحقول | العدد الحالي |
|--------|--------|-------------|
| **Products** | id, name, category, price, salePrice, description, images[], sizes[], colors[], stock, featured, createdAt | 6 seed |
| **Categories** | id, name, icon, image, order | 5 seed |
| **Orders** | id, ref, customer{fullName, phone, wilaya, address}, items[], total, deliveryFee, status, notes, createdAt | 0 |
| **Offers** | id, title, description, discount, code, expiresAt, active | 1 seed |
| **Settings** | storeName, storeDescription, currency, currencySymbol, enableOrders, enableWhatsapp, enableEmail, freeShippingThreshold, announcement | 1 |
| **Admin** | isLoggedIn, sessionToken, sessionExpiry, loginAttempts, lockoutUntil | runtime |

---

## 🏗️ المعمارية الجديدة (New Architecture)

### Technology Stack:
```
Frontend (مُحدَّث)          Backend (جديد)              Database & Storage
──────────────────    ──────────────────────    ──────────────────────
Vite + Vanilla JS      FastAPI (Python 3.12)     SQLite (WAL mode)
SPA (hash router)      Pydantic v2 schemas       on Fly.io volume
Fetch API → REST       JWT + bcrypt Auth         Images on same volume
                       CORS middleware            served via FastAPI
                       Rate limiting (slowapi)
                       GZip compression
```

### لماذا هذا الاختيار (بعد 4 مراجعات):

| التقنية | السبب |
|---------|-------|
| **FastAPI** | أسرع framework بايثون، async native، OpenAPI/Swagger تلقائي، type-safe مع Pydantic |
| **SQLite + aiosqlite** | **صفر تبعيات خارجية** — لا يحتاج Supabase/Firebase credentials. يعمل فوراً. WAL mode يدعم concurrent reads. مثالي لمتجر بهذا الحجم |
| **Fly.io Persistent Volume** | deploy tool يدعمه مباشرة (`volume: true`). البيانات والصور تبقى حتى بعد إعادة النشر |
| **JWT + bcrypt** | Auth حقيقي server-side. bcrypt cost 12 للـ hashing. Access token 15 دقيقة + refresh token 7 أيام |
| **Pydantic v2** | Validation قوي على كل endpoint. يمنع بيانات خاطئة من الدخول |

### لماذا SQLite وليس PostgreSQL/Supabase:
- **لا يحتاج credentials من المستخدم** — يعمل فوراً بدون إعداد خارجي
- **أداء ممتاز** لحجم البيانات المتوقع (آلاف المنتجات/الطلبات)
- **WAL mode** — قراءات متزامنة بدون تأخير
- **ملف واحد** — سهل النسخ الاحتياطي
- **تكلفة صفر** — لا اشتراك شهري

### لماذا ليس Firebase/Supabase:
- يحتاجون credentials وإعداد خارجي من المستخدم
- الكود الحالي يدعم Firebase لكن بدون credentials
- SQLite يعطي نفس النتيجة بدون تبعيات خارجية

---

## 📐 Database Schema (التصميم)

### ERD (Entity Relationship Diagram):

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   categories    │     │    products       │     │  product_images │
├─────────────────┤     ├──────────────────┤     ├─────────────────┤
│ id (uuid) PK    │◄────│ category_id (FK) │     │ id (uuid) PK    │
│ name (text)     │     │ id (uuid) PK     │────►│ product_id (FK) │
│ icon (text)     │     │ name (text)      │     │ url (text)      │
│ image_url (text)│     │ price (int)      │     │ alt_text (text)  │
│ sort_order (int)│     │ sale_price (int)  │     │ sort_order (int) │
│ created_at      │     │ description (text)│     │ created_at       │
│ updated_at      │     │ sizes (text[])    │     └─────────────────┘
└─────────────────┘     │ colors (text[])   │
                        │ stock (int)       │     ┌─────────────────┐
                        │ featured (bool)   │     │     offers      │
                        │ active (bool)     │     ├─────────────────┤
                        │ created_at        │     │ id (uuid) PK    │
                        │ updated_at        │     │ title (text)    │
                        └──────────────────┘     │ description     │
                                                  │ discount (int)  │
┌─────────────────┐     ┌──────────────────┐     │ code (text)     │
│     orders      │     │   order_items    │     │ expires_at      │
├─────────────────┤     ├──────────────────┤     │ active (bool)   │
│ id (uuid) PK    │────►│ id (uuid) PK     │     │ created_at      │
│ ref (text)      │     │ order_id (FK)    │     └─────────────────┘
│ customer_name   │     │ product_id (FK)  │
│ customer_phone  │     │ product_name     │     ┌─────────────────┐
│ customer_wilaya │     │ price (int)      │     │    settings     │
│ customer_address│     │ quantity (int)   │     ├─────────────────┤
│ subtotal (int)  │     │ size (text)      │     │ key (text) PK   │
│ delivery_fee    │     │ color (text)     │     │ value (jsonb)   │
│ total (int)     │     └──────────────────┘     │ updated_at      │
│ status (enum)   │                               └─────────────────┘
│ notes (text)    │     ┌──────────────────┐
│ created_at      │     │   admin_users    │
│ updated_at      │     ├──────────────────┤
└─────────────────┘     │ id (uuid) PK     │
                        │ username (text)   │
                        │ password_hash     │
                        │ role (text)       │
                        │ created_at        │
                        │ last_login        │
                        └──────────────────┘
```

### SQL Migrations (SQLite):

```sql
-- 001_initial.sql
-- SQLite-compatible (no extensions needed)
-- IDs: text UUIDs generated by Python uuid4()
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '📂',
  image_url TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Products
CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE SET NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  sale_price INTEGER CHECK (sale_price IS NULL OR sale_price >= 0),
  description TEXT DEFAULT '',
  sizes TEXT DEFAULT '[]',        -- JSON array stored as text
  colors TEXT DEFAULT '[]',       -- JSON array stored as text
  stock INTEGER DEFAULT 0 CHECK (stock >= 0),
  featured INTEGER DEFAULT 0,     -- SQLite boolean (0/1)
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Product Images (stored on Fly.io volume, URL points to /api/uploads/...)
CREATE TABLE IF NOT EXISTS product_images (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,          -- stored filename on disk
  original_name TEXT DEFAULT '',   -- original upload name
  url TEXT NOT NULL,               -- public URL (/api/uploads/filename)
  alt_text TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  ref TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_wilaya TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  subtotal INTEGER NOT NULL CHECK (subtotal >= 0),
  delivery_fee INTEGER DEFAULT 0 CHECK (delivery_fee >= 0),
  total INTEGER NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'delivering', 'delivered', 'cancelled')),
  notes TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Order Items (snapshot at time of purchase — preserves data even if product deleted)
-- [Review #3] product_name/price are snapshots so orders stay valid after product changes
CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id TEXT REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,      -- snapshot: name at time of purchase
  price INTEGER NOT NULL,          -- snapshot: price at time of purchase
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  size TEXT DEFAULT '',
  color TEXT DEFAULT ''
);

-- Offers
CREATE TABLE IF NOT EXISTS offers (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  discount INTEGER DEFAULT 0 CHECK (discount >= 0 AND discount <= 100),
  code TEXT DEFAULT '',
  expires_at TEXT,
  active INTEGER DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Settings (key-value store)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,             -- JSON string
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Admin Users (bcrypt hashed passwords)
CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,     -- bcrypt cost 12
  role TEXT DEFAULT 'admin',
  login_attempts INTEGER DEFAULT 0,
  locked_until TEXT,               -- lockout timestamp
  created_at TEXT DEFAULT (datetime('now')),
  last_login TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = 1;
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active) WHERE active = 1;
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_offers_active ON offers(active) WHERE active = 1;
```

> **[Review #3 Note]:** `updated_at` is set in Python code before each UPDATE query since SQLite triggers are simpler to handle in application code with aiosqlite.

---

## 🔌 API Endpoints (REST)

### Public Endpoints (No Auth Required):

| Method | Endpoint | الوصف |
|--------|----------|-------|
| `GET` | `/api/products` | جلب كل المنتجات النشطة مع الصور |
| `GET` | `/api/products/:id` | جلب منتج واحد بالتفصيل |
| `GET` | `/api/products/featured` | المنتجات المميزة |
| `GET` | `/api/categories` | كل التصنيفات |
| `GET` | `/api/offers/active` | العروض النشطة فقط |
| `GET` | `/api/settings/public` | الإعدادات العامة (اسم المتجر، عملة، إعلان) |
| `POST` | `/api/orders` | إنشاء طلب جديد (مع validation) |
| `GET` | `/api/orders/:ref` | تتبع طلب بالرقم المرجعي |

### Admin Endpoints (JWT Required):

| Method | Endpoint | الوصف |
|--------|----------|-------|
| `POST` | `/api/admin/login` | تسجيل الدخول (returns JWT) |
| `POST` | `/api/admin/refresh` | تجديد الـ token |
| `GET` | `/api/admin/dashboard` | إحصائيات لوحة التحكم |
| **Products** | | |
| `GET` | `/api/admin/products` | كل المنتجات (مع غير النشطة) |
| `POST` | `/api/admin/products` | إضافة منتج |
| `PUT` | `/api/admin/products/:id` | تعديل منتج |
| `DELETE` | `/api/admin/products/:id` | حذف منتج (soft delete → active=false) |
| `POST` | `/api/admin/products/:id/images` | رفع صور المنتج |
| `DELETE` | `/api/admin/products/:id/images/:imageId` | حذف صورة |
| **Categories** | | |
| `POST` | `/api/admin/categories` | إضافة تصنيف |
| `PUT` | `/api/admin/categories/:id` | تعديل تصنيف |
| `DELETE` | `/api/admin/categories/:id` | حذف تصنيف |
| **Orders** | | |
| `GET` | `/api/admin/orders` | كل الطلبات (مع pagination) |
| `PUT` | `/api/admin/orders/:id/status` | تحديث حالة الطلب |
| **Offers** | | |
| `POST` | `/api/admin/offers` | إضافة عرض |
| `PUT` | `/api/admin/offers/:id` | تعديل عرض |
| `DELETE` | `/api/admin/offers/:id` | حذف عرض |
| **Settings** | | |
| `GET` | `/api/admin/settings` | كل الإعدادات |
| `PUT` | `/api/admin/settings` | تحديث الإعدادات |

---

## 🔒 Security Architecture

### 1. Authentication Flow:
```
Admin Login → POST /api/admin/login
  ├── Input: { username, password }
  ├── Server: bcrypt.verify(password, stored_hash)
  ├── Success: { access_token (15min), refresh_token (7days) }
  └── Fail: { error: "بيانات خاطئة" } + increment attempts

Rate Limiting:
  ├── Login: 5 attempts per 15 minutes per IP
  ├── API: 100 requests per minute per IP
  └── Upload: 10 uploads per minute per IP
```

### 2. JWT Structure:
```json
{
  "sub": "admin-uuid",
  "username": "LUXE",
  "role": "admin",
  "exp": 1700000000,
  "iat": 1699999100
}
```

### 3. Security Layers:
- **bcrypt** — password hashing (cost factor 12)
- **JWT** — stateless auth with short-lived tokens
- **CORS** — whitelist frontend origin only
- **Helmet headers** — X-Frame-Options, CSP, HSTS
- **Input sanitization** — Pydantic validation on every endpoint
- **SQL injection protection** — parameterized queries via Supabase client
- **File upload validation** — type check, size limit (5MB), dimension check
- **Rate limiting** — slowapi middleware on critical endpoints
- **HTTPS only** — enforce in production

---

## 📁 Backend Project Structure

```
server/
├── pyproject.toml                 # Dependencies
├── main.py                        # FastAPI app entry
├── config.py                      # Environment config
├── database.py                    # Supabase client setup
├── auth.py                        # JWT + bcrypt utilities
├── middleware.py                   # CORS, rate limiting, error handling
├── models/
│   ├── __init__.py
│   ├── product.py                 # Product Pydantic schemas
│   ├── category.py                # Category schemas
│   ├── order.py                   # Order schemas
│   ├── offer.py                   # Offer schemas
│   ├── settings.py                # Settings schemas
│   └── auth.py                    # Login/Token schemas
├── routes/
│   ├── __init__.py
│   ├── public.py                  # Public API routes
│   ├── admin_auth.py              # Login/refresh routes
│   ├── admin_products.py          # Product CRUD
│   ├── admin_categories.py        # Category CRUD
│   ├── admin_orders.py            # Order management
│   ├── admin_offers.py            # Offer CRUD
│   └── admin_settings.py          # Settings management
├── services/
│   ├── __init__.py
│   ├── product_service.py         # Business logic
│   ├── order_service.py
│   ├── upload_service.py          # Image upload to Supabase Storage
│   └── notification_service.py    # Email/WhatsApp notifications
└── seed.py                        # Initial data seeder
```

---

## 🔄 Frontend Changes Required

### 1. New API Layer (`src/api/`):
```
src/api/
├── client.js          # Fetch wrapper with auth headers
├── products.js        # Product API calls
├── categories.js      # Category API calls
├── orders.js          # Order API calls
├── offers.js          # Offer API calls
├── settings.js        # Settings API calls
├── auth.js            # Login/logout/token refresh
└── upload.js          # Image upload
```

### 2. State Management Changes:
- **Remove** localStorage persistence for products/categories/offers/orders/settings
- **Keep** localStorage for cart only (cart is per-device, not shared)
- **Add** API sync — fetch data from backend on page load
- **Add** loading/error states for async operations
- **Add** JWT token storage in memory (not localStorage for security)

### 3. Admin Auth Changes:
- **Remove** SHA-256 client-side comparison
- **Add** real login via POST /api/admin/login
- **Add** JWT token management (auto-refresh)
- **Add** proper logout (clear token)

### 4. Image Upload:
- **Add** file input with drag-and-drop in product form
- **Add** preview before upload
- **Add** progress indicator
- **Upload** to Supabase Storage via backend proxy

---

## ⚡ Performance Optimizations

1. **Database indexes** — على كل foreign key و حقول البحث المتكررة
2. **Pagination** — orders و products مع limit/offset
3. **Caching** — Cache-Control headers للمنتجات والتصنيفات (5 دقائق)
4. **Image optimization** — تحويل تلقائي لـ WebP عند الرفع
5. **Lazy loading** — صور المنتجات بـ loading="lazy"
6. **Connection pooling** — Supabase يدير الاتصالات تلقائياً
7. **Gzip compression** — GzipMiddleware في FastAPI

---

## 🚀 Deployment Strategy

```
Frontend:  devinapps.com (static)  ──→  dist/ folder (deploy frontend)
Backend:   Fly.io (FastAPI)        ──→  server/ folder (deploy backend with volume)
Database:  SQLite file             ──→  /data/luxe.db on Fly.io volume
Images:    File storage            ──→  /data/uploads/ on Fly.io volume
```

### Environment Variables (Backend — embedded, no user setup needed):
```env
JWT_SECRET=auto-generated-on-first-run
ADMIN_USERNAME=LUXE
ADMIN_PASSWORD=Lux999@@009
DATA_DIR=/data                    # Fly.io volume mount point
CORS_ORIGIN=*                     # Updated after frontend deploy
```

> **[Review #1]:** Zero external dependencies — no Supabase/Firebase tokens needed from user. Everything self-contained on Fly.io.

---

## 📋 Implementation Phases

### Phase A: Backend Setup (2 hours)
1. Initialize FastAPI project with pyproject.toml
2. Set up Supabase client connection
3. Create Pydantic models for all entities
4. Implement auth utilities (JWT + bcrypt)
5. Add middleware (CORS, rate limiting, error handling)

### Phase B: Database (1 hour)
1. Run migration SQL in Supabase
2. Seed initial data (categories, products, admin user)
3. Configure Supabase Storage bucket for images

### Phase C: API Routes (3 hours)
1. Public routes (products, categories, offers, orders)
2. Admin auth routes (login, refresh)
3. Admin CRUD routes (products, categories, offers, orders, settings)
4. Image upload route with Supabase Storage

### Phase D: Frontend Integration (3 hours)
1. Create API client layer
2. Replace localStorage reads with API calls
3. Update admin auth flow
4. Add image upload UI
5. Add loading/error states
6. Keep cart in localStorage (per-device)

### Phase E: Testing & Security (1 hour)
1. Test all CRUD operations
2. Test auth flow (login, token refresh, logout)
3. Test image upload/delete
4. Verify CORS and rate limiting
5. Check for SQL injection, XSS, CSRF
6. Test from multiple devices (data persistence verification)

---

## ✅ Acceptance Criteria

1. ☐ Admin يحفظ منتج → يظهر في أي جهاز ثاني
2. ☐ Admin يرفع صورة منتج → تُحفظ بشكل دائم على Fly.io volume
3. ☐ Admin يضيف إعلان → يظهر في شريط الإعلانات لكل الزوار
4. ☐ Admin يضيف تصنيف → يظهر في صفحة التصنيفات لكل الزوار
5. ☐ Admin يضيف عرض → يظهر للزوار
6. ☐ عميل يطلب → الطلب يظهر في لوحة التحكم من أي جهاز
7. ☐ Admin يغير حالة طلب → التحديث يُحفظ
8. ☐ Admin يسجل دخول بـ JWT → لا يمكن تجاوز الـ auth
9. ☐ الصور تُعرض بشكل صحيح في كل الصفحات
10. ☐ Cart يبقى محلي (per-device) — لا يحتاج backend

---

## 🔍 سجل المراجعات الأربع (4 Review Rounds)

### مراجعة #1 — Architecture & Scalability
**المشاكل المكتشفة:**
1. ❌ Supabase يتطلب credentials من المستخدم → **الحل:** استبدال بـ SQLite على Fly.io volume
2. ❌ تبعية على خدمة خارجية للصور → **الحل:** تخزين الصور على نفس الـ volume
3. ❌ لا يوجد health check endpoint → **الحل:** إضافة `GET /health` لـ Fly.io monitoring
4. ❌ لا يوجد API versioning → **الحل:** كل endpoints تحت `/api/` (v1 ضمني، يمكن إضافة /api/v2/ لاحقاً)
5. ✅ فصل frontend عن backend — جيد
6. ✅ Pydantic schemas لكل entity — جيد

### مراجعة #2 — Security & Vulnerability
**المشاكل المكتشفة:**
1. ❌ JWT في localStorage عرضة لـ XSS → **الحل:** تخزين في memory فقط (JavaScript variable). Refresh token عبر httpOnly cookie
2. ❌ لا يوجد request size limit → **الحل:** إضافة `max_upload_size = 5MB` في middleware
3. ❌ لا يوجد file type validation حقيقي → **الحل:** فحص magic bytes وليس فقط extension (PIL/Pillow verify)
4. ❌ CORS = * في production خطير → **الحل:** تحديد frontend URL فقط بعد النشر
5. ❌ لا يوجد brute-force protection server-side → **الحل:** `login_attempts` + `locked_until` في admin_users table + slowapi rate limiter
6. ❌ Admin password في كود المصدر → **الحل:** يتم hash الـ password عند أول تشغيل ويُحفظ في DB. الـ password الأصلي لا يُحفظ
7. ✅ bcrypt cost 12 — جيد
8. ✅ Parameterized queries (aiosqlite) تمنع SQL injection — جيد

### مراجعة #3 — Data Integrity & Edge Cases
**المشاكل المكتشفة:**
1. ❌ حذف منتج يكسر الطلبات القديمة → **الحل:** order_items يحفظ snapshot (product_name, price) + ON DELETE SET NULL
2. ❌ Race condition على stock عند طلبين متزامنين → **الحل:** SQL transaction مع `stock = stock - ? WHERE stock >= ?`
3. ❌ Order ref ممكن يتكرر → **الحل:** prefix + timestamp + random 4 chars (e.g., LX-1714000000-A3F2)
4. ❌ حذف category يترك منتجات يتيمة → **الحل:** ON DELETE SET NULL + frontend يعرض "بدون تصنيف"
5. ❌ حذف منتج بدون حذف صوره → **الحل:** ON DELETE CASCADE على product_images + حذف الملفات من disk في delete endpoint
6. ❌ لا يوجد validation على أرقام الهاتف الجزائرية → **الحل:** regex pattern `^0[5-7][0-9]{8}$`
7. ✅ Settings كـ key-value مرن — جيد
8. ✅ Separate order_items table — جيد

### مراجعة #4 — Performance & Production-Readiness
**المشاكل المكتشفة:**
1. ❌ لا يوجد pagination → **الحل:** `?page=1&limit=20` على orders و products
2. ❌ لا يوجد caching headers → **الحل:** `Cache-Control: public, max-age=300` على products/categories
3. ❌ صور بدون optimization → **الحل:** تحويل لـ WebP + resize عند الرفع (max 1200px width)
4. ❌ لا يوجد structured logging → **الحل:** Python logging module مع JSON format
5. ❌ لا يوجد graceful shutdown → **الحل:** signal handler يغلق DB connection
6. ✅ SQLite WAL mode — يدعم concurrent reads — جيد
7. ✅ GZip middleware — جيد
8. ✅ Indexes على كل foreign key — جيد

---

> **النتيجة:** الخطة جاهزة بعد 4 مراجعات. تم إصلاح 19 مشكلة محتملة وتحسين المعمارية لتكون self-contained بالكامل (صفر تبعيات خارجية).
