"""Order management routes."""
import json
import random
import string
import time
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status

from auth import get_current_admin
from database import get_db, new_id
from models.schemas import OrderCreate, OrderOut, OrderStatusUpdate

router = APIRouter(prefix="/api", tags=["orders"])


def _generate_ref() -> str:
    ts = int(time.time())
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"LX-{ts}-{suffix}"


async def _enrich_order(db, row: dict) -> dict:
    items = await db.execute_fetchall(
        "SELECT * FROM order_items WHERE order_id = ?", (row["id"],)
    )
    row["items"] = [dict(i) for i in items]
    return row


@router.post("/orders", response_model=OrderOut, status_code=201)
async def create_order(body: OrderCreate):
    db = await get_db()
    try:
        order_id = new_id()
        ref = _generate_ref()
        now = datetime.now(timezone.utc).isoformat()

        subtotal = 0
        order_items = []

        for item in body.items:
            rows = await db.execute_fetchall(
                "SELECT id, name, price, sale_price, stock FROM products WHERE id = ? AND active = 1",
                (item.product_id,),
            )
            if not rows:
                raise HTTPException(status_code=400, detail=f"المنتج {item.product_id} غير موجود أو غير متاح")
            product = dict(rows[0])

            if product["stock"] < item.quantity:
                raise HTTPException(
                    status_code=400,
                    detail=f"الكمية المطلوبة من '{product['name']}' غير متوفرة (المتاح: {product['stock']})",
                )

            unit_price = product["sale_price"] if product["sale_price"] is not None else product["price"]
            line_total = unit_price * item.quantity
            subtotal += line_total

            order_items.append({
                "id": new_id(),
                "order_id": order_id,
                "product_id": item.product_id,
                "product_name": product["name"],
                "price": unit_price,
                "quantity": item.quantity,
                "size": item.size,
                "color": item.color,
            })

            updated = await db.execute(
                "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
                (item.quantity, item.product_id, item.quantity),
            )
            if updated.rowcount == 0:
                raise HTTPException(status_code=409, detail=f"Race condition: الكمية من '{product['name']}' نفدت")

        delivery_fee = 600
        total = subtotal + delivery_fee

        await db.execute(
            """INSERT INTO orders (id, ref, customer_name, customer_phone, customer_wilaya,
               customer_address, subtotal, delivery_fee, total, status, notes, created_at, updated_at)
               VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)""",
            (order_id, ref, body.customer_name, body.customer_phone, body.customer_wilaya,
             body.customer_address, subtotal, delivery_fee, total, "pending", body.notes, now, now),
        )

        for oi in order_items:
            await db.execute(
                """INSERT INTO order_items (id, order_id, product_id, product_name, price, quantity, size, color)
                   VALUES (?,?,?,?,?,?,?,?)""",
                (oi["id"], oi["order_id"], oi["product_id"], oi["product_name"],
                 oi["price"], oi["quantity"], oi["size"], oi["color"]),
            )

        await db.commit()

        rows = await db.execute_fetchall("SELECT * FROM orders WHERE id = ?", (order_id,))
        return await _enrich_order(db, dict(rows[0]))
    finally:
        await db.close()


@router.get("/orders/{ref}", response_model=OrderOut)
async def track_order(ref: str):
    db = await get_db()
    try:
        rows = await db.execute_fetchall("SELECT * FROM orders WHERE ref = ?", (ref,))
        if not rows:
            raise HTTPException(status_code=404, detail="الطلب غير موجود")
        return await _enrich_order(db, dict(rows[0]))
    finally:
        await db.close()


@router.get("/admin/orders", response_model=list[OrderOut])
async def list_orders(
    status_filter: str | None = Query(default=None, alias="status"),
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    _admin: str = Depends(get_current_admin),
):
    db = await get_db()
    try:
        conditions = []
        params: list = []
        if status_filter:
            conditions.append("status = ?")
            params.append(status_filter)
        where = " WHERE " + " AND ".join(conditions) if conditions else ""
        offset = (page - 1) * limit
        rows = await db.execute_fetchall(
            f"SELECT * FROM orders{where} ORDER BY created_at DESC LIMIT ? OFFSET ?",
            params + [limit, offset],
        )
        results = []
        for r in rows:
            results.append(await _enrich_order(db, dict(r)))
        return results
    finally:
        await db.close()


@router.put("/admin/orders/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: str, body: OrderStatusUpdate, _admin: str = Depends(get_current_admin)
):
    db = await get_db()
    try:
        rows = await db.execute_fetchall("SELECT * FROM orders WHERE id = ?", (order_id,))
        if not rows:
            raise HTTPException(status_code=404, detail="الطلب غير موجود")
        now = datetime.now(timezone.utc).isoformat()
        await db.execute(
            "UPDATE orders SET status = ?, updated_at = ? WHERE id = ?",
            (body.status, now, order_id),
        )
        await db.commit()
        rows = await db.execute_fetchall("SELECT * FROM orders WHERE id = ?", (order_id,))
        return await _enrich_order(db, dict(rows[0]))
    finally:
        await db.close()
