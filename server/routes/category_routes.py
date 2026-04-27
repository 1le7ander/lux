"""Category CRUD routes."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status

from auth import get_current_admin
from database import get_db, new_id
from models.schemas import CategoryCreate, CategoryUpdate, CategoryOut

router = APIRouter(prefix="/api", tags=["categories"])


@router.get("/categories", response_model=list[CategoryOut])
async def list_categories():
    db = await get_db()
    try:
        rows = await db.execute_fetchall("SELECT * FROM categories ORDER BY sort_order, name")
        return [dict(r) for r in rows]
    finally:
        await db.close()


@router.get("/categories/{cat_id}", response_model=CategoryOut)
async def get_category(cat_id: str):
    db = await get_db()
    try:
        rows = await db.execute_fetchall("SELECT * FROM categories WHERE id = ?", (cat_id,))
        if not rows:
            raise HTTPException(status_code=404, detail="التصنيف غير موجود")
        return dict(rows[0])
    finally:
        await db.close()


@router.post("/admin/categories", response_model=CategoryOut, status_code=201)
async def create_category(body: CategoryCreate, _admin: str = Depends(get_current_admin)):
    db = await get_db()
    try:
        cid = new_id()
        now = datetime.now(timezone.utc).isoformat()
        await db.execute(
            "INSERT INTO categories (id, name, icon, image_url, sort_order, created_at, updated_at) VALUES (?,?,?,?,?,?,?)",
            (cid, body.name, body.icon, body.image_url, body.sort_order, now, now),
        )
        await db.commit()
        rows = await db.execute_fetchall("SELECT * FROM categories WHERE id = ?", (cid,))
        return dict(rows[0])
    finally:
        await db.close()


@router.put("/admin/categories/{cat_id}", response_model=CategoryOut)
async def update_category(cat_id: str, body: CategoryUpdate, _admin: str = Depends(get_current_admin)):
    db = await get_db()
    try:
        rows = await db.execute_fetchall("SELECT * FROM categories WHERE id = ?", (cat_id,))
        if not rows:
            raise HTTPException(status_code=404, detail="التصنيف غير موجود")
        existing = dict(rows[0])
        updates = body.model_dump(exclude_unset=True)
        if not updates:
            return existing
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        set_clause = ", ".join(f"{k} = ?" for k in updates)
        vals = list(updates.values()) + [cat_id]
        await db.execute(f"UPDATE categories SET {set_clause} WHERE id = ?", vals)
        await db.commit()
        rows = await db.execute_fetchall("SELECT * FROM categories WHERE id = ?", (cat_id,))
        return dict(rows[0])
    finally:
        await db.close()


@router.delete("/admin/categories/{cat_id}", status_code=204)
async def delete_category(cat_id: str, _admin: str = Depends(get_current_admin)):
    db = await get_db()
    try:
        rows = await db.execute_fetchall("SELECT id FROM categories WHERE id = ?", (cat_id,))
        if not rows:
            raise HTTPException(status_code=404, detail="التصنيف غير موجود")
        await db.execute("DELETE FROM categories WHERE id = ?", (cat_id,))
        await db.commit()
    finally:
        await db.close()
