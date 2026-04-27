"""LUXE Backend — FastAPI + SQLite + JWT Auth."""
import logging
import signal
import sys

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from config import CORS_ORIGIN, UPLOADS_DIR
from database import init_db
from routes.auth_routes import router as auth_router, _ensure_admin_exists
from routes.category_routes import router as category_router
from routes.product_routes import router as product_router
from routes.order_routes import router as order_router
from routes.offer_routes import router as offer_router
from routes.settings_routes import router as settings_router
from seed import seed_if_empty

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("luxe")

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting LUXE Backend...")
    await init_db()
    await _ensure_admin_exists()
    await seed_if_empty()
    logger.info("Database initialized, admin created, seed data loaded.")
    yield
    logger.info("Shutting down LUXE Backend...")


app = FastAPI(
    title="LUXE API",
    description="LUXE luxury fashion e-commerce backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.state.limiter = limiter


@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(
        status_code=429,
        content={"detail": "تم تجاوز عدد الطلبات المسموح. حاول لاحقاً"},
    )


origins = ["*"] if CORS_ORIGIN == "*" else [o.strip() for o in CORS_ORIGIN.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=500)

app.include_router(auth_router)
app.include_router(category_router)
app.include_router(product_router)
app.include_router(order_router)
app.include_router(offer_router)
app.include_router(settings_router)

app.mount("/api/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


@app.get("/health")
async def health():
    return {"status": "ok", "service": "luxe-backend"}


@app.get("/api")
async def api_root():
    return {
        "service": "LUXE API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "auth": "/api/auth/login",
            "categories": "/api/categories",
            "products": "/api/products",
            "orders": "/api/orders/{ref}",
            "offers": "/api/offers",
            "settings": "/api/settings",
            "health": "/health",
        },
    }


def _shutdown(signum, frame):
    logger.info("Received shutdown signal, exiting...")
    sys.exit(0)


signal.signal(signal.SIGTERM, _shutdown)
signal.signal(signal.SIGINT, _shutdown)
