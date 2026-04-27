"""Application configuration — reads from env with sensible defaults."""
import os
import secrets

DATA_DIR = os.getenv("DATA_DIR", "/data")
DB_PATH = os.path.join(DATA_DIR, "luxe.db")
UPLOADS_DIR = os.path.join(DATA_DIR, "uploads")

JWT_SECRET = os.getenv("JWT_SECRET", secrets.token_hex(32))
JWT_ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 7

ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "LUXE")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Lux999@@009")

CORS_ORIGIN = os.getenv("CORS_ORIGIN", "*")

MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_IMAGE_WIDTH = 1200

RATE_LIMIT_LOGIN = "5/15minutes"
RATE_LIMIT_API = "100/minute"
