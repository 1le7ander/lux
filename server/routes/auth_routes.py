"""Admin authentication routes."""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Request, status

from auth import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from config import ADMIN_USERNAME, ADMIN_PASSWORD
from database import get_db, new_id
from models.schemas import LoginRequest, TokenResponse, RefreshRequest

router = APIRouter(prefix="/api/auth", tags=["auth"])


async def _ensure_admin_exists():
    """Create the default admin user on first run if not exists."""
    db = await get_db()
    try:
        row = await db.execute_fetchall(
            "SELECT id FROM admin_users WHERE username = ?", (ADMIN_USERNAME,)
        )
        if not row:
            await db.execute(
                "INSERT INTO admin_users (id, username, password_hash) VALUES (?, ?, ?)",
                (new_id(), ADMIN_USERNAME, hash_password(ADMIN_PASSWORD)),
            )
            await db.commit()
    finally:
        await db.close()


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, request: Request):
    db = await get_db()
    try:
        rows = await db.execute_fetchall(
            "SELECT id, username, password_hash, login_attempts, locked_until FROM admin_users WHERE username = ?",
            (body.username,),
        )
        if not rows:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="اسم المستخدم أو كلمة المرور غير صحيحة")

        user = dict(rows[0])
        now = datetime.now(timezone.utc).isoformat()

        if user["locked_until"] and user["locked_until"] > now:
            raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="الحساب مقفل. حاول بعد 15 دقيقة")

        if user["locked_until"] and user["locked_until"] <= now:
            await db.execute(
                "UPDATE admin_users SET login_attempts = 0, locked_until = NULL WHERE id = ?",
                (user["id"],),
            )
            await db.commit()
            user["login_attempts"] = 0

        if not verify_password(body.password, user["password_hash"]):
            attempts = (user["login_attempts"] or 0) + 1
            locked = None
            if attempts >= 5:
                locked = (datetime.now(timezone.utc).replace(microsecond=0) + timedelta(minutes=15)).isoformat()
            await db.execute(
                "UPDATE admin_users SET login_attempts = ?, locked_until = ? WHERE id = ?",
                (attempts, locked, user["id"]),
            )
            await db.commit()
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="اسم المستخدم أو كلمة المرور غير صحيحة")

        await db.execute(
            "UPDATE admin_users SET login_attempts = 0, locked_until = NULL, last_login = ? WHERE id = ?",
            (now, user["id"]),
        )
        await db.commit()

        access = create_access_token(user["username"])
        refresh = create_refresh_token(user["username"])
        return TokenResponse(access_token=access, refresh_token=refresh)
    finally:
        await db.close()


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest):
    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="توكن غير صالح")
    username = payload.get("sub")
    access = create_access_token(username)
    return TokenResponse(access_token=access)
