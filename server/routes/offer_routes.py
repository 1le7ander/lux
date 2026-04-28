"""Offer CRUD routes."""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_admin
from database import get_db, new_id
from models.schemas import OfferCreate, OfferOut, OfferUpdate

router = APIRouter(prefix="/api", tags=["offers"])


@router.get("/offers", response_model=list[OfferOut])
async def list_offers():
    db = await get_db()
    try:
        rows = await db.execute_fetchall(
            "SELECT * FROM offers WHERE active = 1 ORDER BY created_at DESC"
        )
        result = []
        for r in rows:
            d = dict(r)
            d["active"] = bool(d["active"])
            result.append(d)
        return result
    finally:
        await db.close()


@router.get("/admin/offers", response_model=list[OfferOut])
async def list_all_offers(_admin: str = Depends(get_current_admin)):
    db = await get_db()
    try:
        rows = await db.execute_fetchall("SELECT * FROM offers ORDER BY created_at DESC")
        result = []
        for r in rows:
            d = dict(r)
            d["active"] = bool(d["active"])
            result.append(d)
        return result
    finally:
        await db.close()


@router.post("/admin/offers", response_model=OfferOut, status_code=201)
async def create_offer(body: OfferCreate, _admin: str = Depends(get_current_admin)):
    db = await get_db()
    try:
        oid = new_id()
        now = datetime.now(timezone.utc).isoformat()
        await db.execute(
            """INSERT INTO offers (id, title, description, discount, code, expires_at, active, created_at, updated_at)
               VALUES (?,?,?,?,?,?,?,?,?)""",
            (oid, body.title, body.description, body.discount, body.code,
             body.expires_at, 1 if body.active else 0, now, now),
        )
        await db.commit()
        rows = await db.execute_fetchall("SELECT * FROM offers WHERE id = ?", (oid,))
        d = dict(rows[0])
        d["active"] = bool(d["active"])
        return d
    finally:
        await db.close()


@router.put("/admin/offers/{offer_id}", response_model=OfferOut)
async def update_offer(offer_id: str, body: OfferUpdate, _admin: str = Depends(get_current_admin)):
    db = await get_db()
    try:
        rows = await db.execute_fetchall("SELECT * FROM offers WHERE id = ?", (offer_id,))
        if not rows:
            raise HTTPException(status_code=404, detail="العرض غير موجود")
        updates = body.model_dump(exclude_unset=True)
        if not updates:
            d = dict(rows[0])
            d["active"] = bool(d["active"])
            return d
        if "active" in updates:
            updates["active"] = 1 if updates["active"] else 0
        updates["updated_at"] = datetime.now(timezone.utc).isoformat()
        set_clause = ", ".join(f"{k} = ?" for k in updates)
        vals = list(updates.values()) + [offer_id]
        await db.execute(f"UPDATE offers SET {set_clause} WHERE id = ?", vals)
        await db.commit()
        rows = await db.execute_fetchall("SELECT * FROM offers WHERE id = ?", (offer_id,))
        d = dict(rows[0])
        d["active"] = bool(d["active"])
        return d
    finally:
        await db.close()


@router.delete("/admin/offers/{offer_id}", status_code=204)
async def delete_offer(offer_id: str, _admin: str = Depends(get_current_admin)):
    db = await get_db()
    try:
        rows = await db.execute_fetchall("SELECT id FROM offers WHERE id = ?", (offer_id,))
        if not rows:
            raise HTTPException(status_code=404, detail="العرض غير موجود")
        await db.execute("DELETE FROM offers WHERE id = ?", (offer_id,))
        await db.commit()
    finally:
        await db.close()
