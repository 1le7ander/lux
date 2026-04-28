"""Product CRUD routes with image management."""
import json
import os
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from PIL import Image as PILImage

from auth import get_current_admin
from config import ALLOWED_IMAGE_TYPES, MAX_IMAGE_WIDTH, MAX_UPLOAD_SIZE, UPLOADS_DIR
from database import get_db, new_id
from models.schemas import ProductCreate, ProductOut, ProductUpdate

router = APIRouter(prefix="/api", tags=["products"])


def _parse_json_list(val: str) -> list[str]:
    try:
        return json.loads(val) if val else []
    except (json.JSONDecodeError, TypeError):
        return []


async def _enrich_product(db, row: dict) -> dict:
    row["sizes"] = _parse_json_list(row.get("sizes", "[]"))
    row["colors"] = _parse_json_list(row.get("colors", "[]"))
    row["featured"] = bool(row.get("featured"))
    row["active"] = bool(row.get("active"))
    imgs = await db.execute_fetchall(
        "SELECT id, url, alt_text, sort_order FROM product_images WHERE product_id = ? ORDER BY sort_order",
        (row["id"],),
    )
    row["images"] = [dict(i) for i in imgs]
    return row


@router.get("/products", response_model=list[ProductOut])
async def list_products(
    category_id: str | None = None,
    featured: bool | None = None,
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=50, ge=1, le=100),
):
    db = await get_db()
    try:
        conditions = ["active = 1"]
        params: list = []
        if category_id:
            conditions.append("category_id = ?")
            params.append(category_id)
        if featured is not None:
            conditions.append("featured = ?")
            params.append(1 if featured else 0)
        where = " AND ".join(conditions)
        offset = (page - 1) * limit
        rows = await db.execute_fetchall(
            f"SELECT * FROM products WHERE {where} ORDER BY created_at DESC LIMIT ? OFFSET ?",
            params + [limit, offset],
        )
        results = []
        for r in rows:
            results.append(await _enrich_product(db, dict(r)))
        return results
    finally:
        await db.close()


@router.get("/products/{product_id}", response_model=ProductOut)
async def get_product(product_id: str):
    db = await get_db()
    try:
        rows = await db.execute_fetchall("SELECT * FROM products WHERE id = ?", (product_id,))
        if not rows:
            raise HTTPException(status_code=404, detail="المنتج غير موجود")
        return await _enrich_product(db, dict(rows[0]))
    finally:
        await db.close()


@router.post("/admin/products", response_model=ProductOut, status_code=201)
async def create_product(body: ProductCreate, _admin: str = Depends(get_current_admin)):
    db = await get_db()
    try:
        pid = new_id()
        now = datetime.now(timezone.utc).isoformat()
        await db.execute(
            """INSERT INTO products
               (id, name, category_id, price, sale_price, description, sizes, colors, stock, featured, active, created_at, updated_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,1,?,?)""",
            (
                pid, body.name, body.category_id, body.price, body.sale_price,
                body.description, json.dumps(body.sizes), json.dumps(body.colors),
                body.stock, 1 if body.featured else 0, now, now,
            ),
        )
        await db.commit()
        rows = await db.execute_fetchall("SELECT * FROM products WHERE id = ?", (pid,))
        return await _enrich_product(db, dict(rows[0]))
    finally:
        await db.close()


@router.put("/admin/products/{product_id}", response_model=ProductOut)
async def update_product(product_id: str, body: ProductUpdate, _admin: str = Depends(get_current_admin)):
    db = await get_db()
    try:
        rows = await db.execute_fetchall("SELECT * FROM products WHERE id = ?", (product_id,))
        if not rows:
            raise HTTPException(status_code=404, detail="المنتج غير موجود")
        updates = body.model_dump(exclude_unset=True)
        if not updates:
            return await _enrich_product(db, dict(rows[0]))
        if "sizes" in updates:
            updates["sizes"] = json.dumps(updates["sizes"])
        if "colors" in updates:
            updates["colors"] = json.dumps(updates["colors"])
        if "featured" in updates:
            updates["featured"] = 1 if updates["featured"] else 0
        if "active" in updates:
            updates["active"] = 1 if updates["active"] else 0
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        set_clause = ", ".join(f"{k} = ?" for k in updates)
        vals = list(updates.values()) + [product_id]
        await db.execute(f"UPDATE products SET {set_clause} WHERE id = ?", vals)
        await db.commit()
        rows = await db.execute_fetchall("SELECT * FROM products WHERE id = ?", (product_id,))
        return await _enrich_product(db, dict(rows[0]))
    finally:
        await db.close()


@router.delete("/admin/products/{product_id}", status_code=204)
async def delete_product(product_id: str, _admin: str = Depends(get_current_admin)):
    db = await get_db()
    try:
        rows = await db.execute_fetchall("SELECT id FROM products WHERE id = ?", (product_id,))
        if not rows:
            raise HTTPException(status_code=404, detail="المنتج غير موجود")
        imgs = await db.execute_fetchall(
            "SELECT filename FROM product_images WHERE product_id = ?", (product_id,)
        )
        for img in imgs:
            path = os.path.join(UPLOADS_DIR, img["filename"])
            if os.path.exists(path):
                os.remove(path)
        await db.execute("DELETE FROM products WHERE id = ?", (product_id,))
        await db.commit()
    finally:
        await db.close()


@router.post("/admin/products/{product_id}/images", status_code=201)
async def upload_product_image(
    product_id: str,
    file: UploadFile = File(...),
    _admin: str = Depends(get_current_admin),
):
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="نوع الملف غير مسموح. استخدم JPEG, PNG, WebP, أو GIF")

    content = await file.read()
    if len(content) > MAX_UPLOAD_SIZE:
        raise HTTPException(status_code=400, detail="حجم الملف يتجاوز 5MB")

    db = await get_db()
    try:
        rows = await db.execute_fetchall("SELECT id FROM products WHERE id = ?", (product_id,))
        if not rows:
            raise HTTPException(status_code=404, detail="المنتج غير موجود")

        ext = "webp"
        filename = f"{uuid.uuid4().hex}.{ext}"
        filepath = os.path.join(UPLOADS_DIR, filename)

        import io
        img = PILImage.open(io.BytesIO(content))
        img.verify()
        img = PILImage.open(io.BytesIO(content))
        if img.width > MAX_IMAGE_WIDTH:
            ratio = MAX_IMAGE_WIDTH / img.width
            img = img.resize((MAX_IMAGE_WIDTH, int(img.height * ratio)), PILImage.LANCZOS)
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        img.save(filepath, "WEBP", quality=85)

        img_id = new_id()
        url = f"/api/uploads/{filename}"
        count = await db.execute_fetchall(
            "SELECT COUNT(*) as c FROM product_images WHERE product_id = ?", (product_id,)
        )
        sort_order = count[0]["c"] if count else 0

        await db.execute(
            "INSERT INTO product_images (id, product_id, filename, original_name, url, alt_text, sort_order) VALUES (?,?,?,?,?,?,?)",
            (img_id, product_id, filename, file.filename or "", url, "", sort_order),
        )
        await db.commit()
        return {"id": img_id, "url": url, "filename": filename}
    finally:
        await db.close()


@router.delete("/admin/products/{product_id}/images/{image_id}", status_code=204)
async def delete_product_image(
    product_id: str, image_id: str, _admin: str = Depends(get_current_admin)
):
    db = await get_db()
    try:
        rows = await db.execute_fetchall(
            "SELECT filename FROM product_images WHERE id = ? AND product_id = ?",
            (image_id, product_id),
        )
        if not rows:
            raise HTTPException(status_code=404, detail="الصورة غير موجودة")
        path = os.path.join(UPLOADS_DIR, rows[0]["filename"])
        if os.path.exists(path):
            os.remove(path)
        await db.execute("DELETE FROM product_images WHERE id = ?", (image_id,))
        await db.commit()
    finally:
        await db.close()
