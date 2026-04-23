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
    <section className="container-luxe py-10">
      {title && (
        <h2 className="mb-6 font-serif text-3xl text-white md:text-4xl">
          {title}
        </h2>
      )}
      {products.length === 0 ? (
        <div className="rounded-2xl bg-white/[0.03] p-10 text-center text-white/60 ring-1 ring-white/5">
          لا توجد منتجات في هذا التصنيف.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}
