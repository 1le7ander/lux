"""Pydantic v2 schemas for request/response validation."""
import re
from pydantic import BaseModel, Field, field_validator


# ── Auth ─────────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=100)

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str | None = None
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str


# ── Category ─────────────────────────────────────────────
class CategoryCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    icon: str = Field(default="📂", max_length=10)
    image_url: str = Field(default="", max_length=500)
    sort_order: int = Field(default=0, ge=0)

class CategoryUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=100)
    icon: str | None = Field(default=None, max_length=10)
    image_url: str | None = Field(default=None, max_length=500)
    sort_order: int | None = Field(default=None, ge=0)

class CategoryOut(BaseModel):
    id: str
    name: str
    icon: str
    image_url: str
    sort_order: int
    created_at: str
    updated_at: str


# ── Product ──────────────────────────────────────────────
class ProductCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    category_id: str | None = None
    price: int = Field(..., ge=0)
    sale_price: int | None = Field(default=None, ge=0)
    description: str = Field(default="", max_length=5000)
    sizes: list[str] = Field(default_factory=list)
    colors: list[str] = Field(default_factory=list)
    stock: int = Field(default=0, ge=0)
    featured: bool = False

class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=200)
    category_id: str | None = None
    price: int | None = Field(default=None, ge=0)
    sale_price: int | None = Field(default=None, ge=0)
    description: str | None = Field(default=None, max_length=5000)
    sizes: list[str] | None = None
    colors: list[str] | None = None
    stock: int | None = Field(default=None, ge=0)
    featured: bool | None = None
    active: bool | None = None

class ProductImageOut(BaseModel):
    id: str
    url: str
    alt_text: str
    sort_order: int

class ProductOut(BaseModel):
    id: str
    name: str
    category_id: str | None
    price: int
    sale_price: int | None
    description: str
    sizes: list[str]
    colors: list[str]
    stock: int
    featured: bool
    active: bool
    images: list[ProductImageOut] = Field(default_factory=list)
    created_at: str
    updated_at: str


# ── Order ────────────────────────────────────────────────
PHONE_RE = re.compile(r"^0[5-7][0-9]{8}$")

class OrderItemCreate(BaseModel):
    product_id: str
    quantity: int = Field(..., ge=1, le=100)
    size: str = ""
    color: str = ""

class OrderCreate(BaseModel):
    customer_name: str = Field(..., min_length=2, max_length=100)
    customer_phone: str = Field(..., min_length=10, max_length=10)
    customer_wilaya: str = Field(..., min_length=1, max_length=100)
    customer_address: str = Field(..., min_length=5, max_length=500)
    items: list[OrderItemCreate] = Field(..., min_length=1)
    notes: str = Field(default="", max_length=1000)

    @field_validator("customer_phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        if not PHONE_RE.match(v):
            raise ValueError("رقم الهاتف يجب أن يبدأ بـ 05/06/07 ويتكون من 10 أرقام")
        return v

class OrderStatusUpdate(BaseModel):
    status: str = Field(...)

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        allowed = {"pending", "confirmed", "delivering", "delivered", "cancelled"}
        if v not in allowed:
            raise ValueError(f"الحالة يجب أن تكون واحدة من: {', '.join(allowed)}")
        return v

class OrderItemOut(BaseModel):
    id: str
    product_id: str | None
    product_name: str
    price: int
    quantity: int
    size: str
    color: str

class OrderOut(BaseModel):
    id: str
    ref: str
    customer_name: str
    customer_phone: str
    customer_wilaya: str
    customer_address: str
    subtotal: int
    delivery_fee: int
    total: int
    status: str
    notes: str
    items: list[OrderItemOut] = Field(default_factory=list)
    created_at: str
    updated_at: str


# ── Offer ────────────────────────────────────────────────
class OfferCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="", max_length=2000)
    discount: int = Field(default=0, ge=0, le=100)
    code: str = Field(default="", max_length=50)
    expires_at: str | None = None
    active: bool = True

class OfferUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=200)
    description: str | None = Field(default=None, max_length=2000)
    discount: int | None = Field(default=None, ge=0, le=100)
    code: str | None = Field(default=None, max_length=50)
    expires_at: str | None = None
    active: bool | None = None

class OfferOut(BaseModel):
    id: str
    title: str
    description: str
    discount: int
    code: str
    expires_at: str | None
    active: bool
    created_at: str
    updated_at: str


# ── Settings ─────────────────────────────────────────────
class SettingUpdate(BaseModel):
    value: str | int | float | bool | dict | list


# ── Pagination ───────────────────────────────────────────
class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    limit: int
    pages: int
