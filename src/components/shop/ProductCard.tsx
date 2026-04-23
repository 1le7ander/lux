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
    <article className="group card overflow-hidden transition-shadow hover:shadow-luxe">
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden">
          <Image
            src={product.image}
            alt={product.title}
            fill
            sizes="(max-width:768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-2 top-2 flex items-center justify-between">
            {discount > 0 && (
              <span className="rounded-full bg-red-500/90 px-2.5 py-1 text-xs font-bold text-white">
                -{discount}%
              </span>
            )}
            {product.badge && (
              <span className="ms-auto rounded-full bg-gold/90 px-2.5 py-1 text-xs font-bold text-ink-0">
                {product.badge}
              </span>
            )}
          </div>
        </div>
      </Link>
      <div className="p-4">
        <div className="text-[11px] uppercase tracking-wider text-white/40">
          {categoryLabel(product.category)}
        </div>
        <Link
          href={`/product/${product.id}`}
          className="mt-0.5 line-clamp-1 font-medium text-white hover:text-gold"
        >
          {product.title}
        </Link>
        <div className="mt-2 flex items-center justify-between gap-2">
          <div>
            <div className="font-serif text-lg font-bold text-gold">
              {formatPrice(product.price)}
            </div>
            {product.oldPrice && product.oldPrice > product.price && (
              <div className="text-xs text-white/40 line-through">
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
            className="btn btn-primary !px-4 !py-2 !text-xs"
          >
            🛍 إضافة
          </button>
        </div>
      </div>
    </article>
  );
}
