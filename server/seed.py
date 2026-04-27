"""Seed the database with initial data if empty."""
import json
from database import get_db, new_id


SEED_CATEGORIES = [
    {"name": "فساتين", "icon": "👗", "sort_order": 0},
    {"name": "أحذية", "icon": "👠", "sort_order": 1},
    {"name": "حقائب", "icon": "👜", "sort_order": 2},
    {"name": "إكسسوارات", "icon": "💎", "sort_order": 3},
    {"name": "ملابس رجالية", "icon": "🤵", "sort_order": 4},
]

SEED_PRODUCTS = [
    {"name": "فستان سهرة فاخر", "price": 25000, "sale_price": 22000, "description": "فستان سهرة أنيق بتصميم عصري", "sizes": ["S", "M", "L", "XL"], "colors": ["أسود", "أحمر", "ذهبي"], "stock": 15, "featured": True, "cat_idx": 0},
    {"name": "حذاء كلاسيكي", "price": 12000, "description": "حذاء جلد طبيعي صناعة يدوية", "sizes": ["38", "39", "40", "41", "42"], "colors": ["أسود", "بني"], "stock": 20, "featured": True, "cat_idx": 1},
    {"name": "حقيبة يد فاخرة", "price": 18000, "sale_price": 15000, "description": "حقيبة يد من الجلد الإيطالي", "sizes": [], "colors": ["أسود", "بيج", "أحمر"], "stock": 10, "featured": True, "cat_idx": 2},
    {"name": "ساعة ذهبية", "price": 35000, "description": "ساعة يد ذهبية مع ألماس", "sizes": [], "colors": ["ذهبي", "فضي"], "stock": 5, "featured": True, "cat_idx": 3},
    {"name": "بدلة رسمية", "price": 45000, "sale_price": 40000, "description": "بدلة رسمية إيطالية بقماش فاخر", "sizes": ["M", "L", "XL", "XXL"], "colors": ["أسود", "كحلي", "رمادي"], "stock": 8, "featured": False, "cat_idx": 4},
    {"name": "عطر فاخر", "price": 8000, "description": "عطر فرنسي فاخر بتركيبة حصرية", "sizes": ["50ml", "100ml"], "colors": [], "stock": 30, "featured": True, "cat_idx": 3},
]

SEED_OFFERS = [
    {"title": "تخفيضات الموسم", "description": "خصم 20% على جميع المنتجات", "discount": 20, "code": "LUXE20", "active": True},
]

SEED_SETTINGS = {
    "storeName": "LUXE",
    "storeDescription": "أزياء فاخرة — Luxury Fashion",
    "currency": "DZD",
    "currencySymbol": "د.ج",
    "enableOrders": True,
    "deliveryFee": 600,
    "freeShippingThreshold": 50000,
    "announcement": "مرحباً بكم في LUXE — أفخم متجر أزياء في الجزائر 🇩🇿",
}


async def seed_if_empty():
    db = await get_db()
    try:
        rows = await db.execute_fetchall("SELECT COUNT(*) as c FROM categories")
        if rows[0]["c"] > 0:
            return

        cat_ids = []
        for cat in SEED_CATEGORIES:
            cid = new_id()
            cat_ids.append(cid)
            await db.execute(
                "INSERT INTO categories (id, name, icon, sort_order) VALUES (?,?,?,?)",
                (cid, cat["name"], cat["icon"], cat["sort_order"]),
            )

        for prod in SEED_PRODUCTS:
            pid = new_id()
            cat_id = cat_ids[prod["cat_idx"]]
            await db.execute(
                """INSERT INTO products (id, name, category_id, price, sale_price, description, sizes, colors, stock, featured, active)
                   VALUES (?,?,?,?,?,?,?,?,?,?,1)""",
                (pid, prod["name"], cat_id, prod["price"], prod.get("sale_price"),
                 prod["description"], json.dumps(prod["sizes"]), json.dumps(prod["colors"]),
                 prod["stock"], 1 if prod["featured"] else 0),
            )

        for offer in SEED_OFFERS:
            await db.execute(
                "INSERT INTO offers (id, title, description, discount, code, active) VALUES (?,?,?,?,?,?)",
                (new_id(), offer["title"], offer["description"], offer["discount"],
                 offer["code"], 1 if offer["active"] else 0),
            )

        for key, value in SEED_SETTINGS.items():
            await db.execute(
                "INSERT INTO settings (key, value) VALUES (?, ?)",
                (key, json.dumps(value)),
            )

        await db.commit()
    finally:
        await db.close()
