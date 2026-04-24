import { ProductCard } from "./ProductCard";
import type { Product } from "@/products/types";

export function ProductGrid({
  title,
  products,
}: {
  title?: string;
  products: Product[];
}) {
  return (
    <section className="container-luxe py-10 sm:py-14">
      {title && (
        <header className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
          <div>
            <h2 className="h-section">{title}</h2>
            <div className="mt-3 h-px w-16 bg-gradient-to-l from-gold to-transparent" />
          </div>
        </header>
      )}
      {products.length === 0 ? (
        <div className="card p-10 text-center text-white/60">
          لا توجد منتجات في هذا التصنيف.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:gap-5">
          {products.map((p, i) => (
            <div
              key={p.id}
              className="animate-slide-up"
              style={{ animationDelay: `${Math.min(i * 60, 500)}ms` }}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
