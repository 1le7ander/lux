"""Settings key-value store routes."""
import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_admin
from database import get_db
from models.schemas import SettingUpdate

router = APIRouter(prefix="/api", tags=["settings"])


@router.get("/settings")
async def get_all_settings():
    db = await get_db()
    try:
        rows = await db.execute_fetchall("SELECT key, value FROM settings")
        result = {}
        for r in rows:
            try:
                result[r["key"]] = json.loads(r["value"])
            except (json.JSONDecodeError, TypeError):
                result[r["key"]] = r["value"]
        return result
    finally:
        await db.close()


@router.get("/settings/{key}")
async def get_setting(key: str):
    db = await get_db()
    try:
        rows = await db.execute_fetchall("SELECT value FROM settings WHERE key = ?", (key,))
        if not rows:
            raise HTTPException(status_code=404, detail="الإعداد غير موجود")
        try:
            return {"key": key, "value": json.loads(rows[0]["value"])}
        except (json.JSONDecodeError, TypeError):
            return {"key": key, "value": rows[0]["value"]}
    finally:
        await db.close()


@router.put("/admin/settings/{key}")
async def update_setting(key: str, body: SettingUpdate, _admin: str = Depends(get_current_admin)):
    db = await get_db()
    try:
        now = datetime.now(timezone.utc).isoformat()
        value_str = json.dumps(body.value)
        await db.execute(
            "INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = ?, updated_at = ?",
            (key, value_str, now, value_str, now),
        )
        await db.commit()
        return {"key": key, "value": body.value}
    finally:
        await db.close()
