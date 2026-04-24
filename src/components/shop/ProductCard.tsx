"use client";

import Image from "next/image";
import Link from "next/link";
import { categoryLabel } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/stores/cart-store";
import { openCart } from "@/components/site/cart-bus";
import { toast } from "@/components/site/ToastHost";
import type { Product } from "@/products/types";

export function ProductCard({ product }: { product: Product }) {
  const add = useCart((s) => s.add);

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(
          ((product.oldPrice - product.price) / product.oldPrice) * 100
        )
      : 0;

  return (
    <article className="group card card-hover flex flex-col overflow-hidden">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110"
          />
          {/* overlay on hover */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-0/80 via-ink-0/10 to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-90" />
          <div className="absolute inset-x-2 top-2 flex items-center justify-between gap-2">
            {discount > 0 && (
              <span className="rounded-full bg-red-500/95 px-2.5 py-1 text-[10px] font-bold text-white shadow-[0_6px_16px_-4px_rgba(239,68,68,0.6)] sm:text-xs">
                -{discount}%
              </span>
            )}
            {product.badge && (
              <span className="ms-auto rounded-full bg-gold/95 px-2.5 py-1 text-[10px] font-bold text-ink-0 shadow-[0_6px_16px_-4px_rgba(212,175,55,0.6)] sm:text-xs">
                {product.badge}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 sm:text-[11px]">
          {categoryLabel(product.category)}
        </div>
        <Link
          href={`/product/${product.id}`}
          className="line-clamp-1 text-sm font-medium text-white transition-colors hover:text-gold sm:text-base"
        >
          {product.title}
        </Link>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <div className="min-w-0">
            <div className="font-serif text-base font-bold text-gold sm:text-lg">
              {formatPrice(product.price)}
            </div>
            {product.oldPrice && product.oldPrice > product.price && (
              <div className="text-[11px] text-white/40 line-through sm:text-xs">
                {formatPrice(product.oldPrice)}
              </div>
            )}
          </div>
          <button
            onClick={() => {
              add(product, 1);
              toast("تمت الإضافة إلى السلة", "success");
              openCart();
            }}
            aria-label={`إضافة ${product.title} إلى السلة`}
            className="btn btn-primary !px-3 !py-2 !text-xs sm:!px-4"
          >
            <span aria-hidden>🛍</span>
            <span className="hidden xs:inline">إضافة</span>
          </button>
        </div>
      </div>
    </article>
  );
}
