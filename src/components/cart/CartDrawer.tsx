"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/stores/cart-store";
import { closeCart, onCartEvent } from "@/components/site/cart-bus";
import { CartItem } from "./CartItem";
import { formatPrice } from "@/lib/format";
import { SITE } from "@/lib/config";

export function CartDrawer() {
  const [open, setOpen] = useState(false);
  const items = useCart((s) => s.items);
  const subtotal = useCart((s) => s.subtotal());

  useEffect(() => {
    const offOpen = onCartEvent("open", () => setOpen(true));
    const offClose = onCartEvent("close", () => setOpen(false));
    return () => {
      offOpen();
      offClose();
    };
  }, []);

  const freeShippingMissing = Math.max(0, SITE.freeShippingOver - subtotal);

  return (
    <div
      aria-hidden={!open}
      className={`fixed inset-0 z-50 transition ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={() => closeCart()}
      />
      <aside
        className={`absolute left-0 top-0 flex h-full w-full max-w-md flex-col bg-ink-1 shadow-2xl ring-1 ring-white/10 transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h3 className="font-serif text-lg text-gold">🛍 سلة المشتريات</h3>
          <button
            onClick={() => closeCart()}
            aria-label="إغلاق"
            className="rounded-full p-2 text-white/70 hover:bg-white/5"
          >
            ✕
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto mb-4 text-5xl opacity-40">🛒</div>
              <p className="text-white/70">سلتك فارغة</p>
              <p className="mt-1 text-sm text-white/40">أضف منتجات لتظهر هنا</p>
              <button
                onClick={() => closeCart()}
                className="btn btn-primary mt-6"
              >
                ابدأ التسوق
              </button>
            </div>
          ) : (
            <ul className="flex flex-col gap-3">
              {items.map((l) => (
                <CartItem key={l.id} line={l} />
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="border-t border-white/10 bg-ink-2/60 p-5">
            {freeShippingMissing > 0 && (
              <div className="mb-3 rounded-xl bg-gold/10 px-3 py-2 text-xs text-gold-soft ring-1 ring-gold/20">
                🚚 أضف {formatPrice(freeShippingMissing)} للحصول على شحن مجاني
              </div>
            )}
            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="text-white/60">المجموع الفرعي</span>
              <span className="font-serif text-lg text-gold">
                {formatPrice(subtotal)}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={() => closeCart()}
              className="btn btn-primary w-full"
            >
              ← متابعة الدفع
            </Link>
          </footer>
        )}
      </aside>
    </div>
  );
}
