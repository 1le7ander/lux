import { notFound } from "next/navigation";
import { getSeedCatalog, findSeedProduct } from "@/products";
import { categoryLabel } from "@/lib/config";
import { formatPrice } from "@/lib/format";
import { Gallery } from "@/components/product/Gallery";
import { ProductActions } from "./ProductActions";

export async function generateStaticParams() {
  return getSeedCatalog().map((p) => ({ id: p.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const p = findSeedProduct(id);
  return p ? { title: p.title, description: p.description } : {};
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = findSeedProduct(id);
  if (!product) notFound();

  const images = product.gallery?.length
    ? product.gallery
    : [product.image];

  const discount =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  return (
    <section className="container-luxe grid gap-8 py-10 md:grid-cols-2">
      <Gallery images={images} title={product.title} />

      <div className="flex flex-col gap-4">
        <div className="text-[11px] uppercase tracking-widest text-white/50">
          {categoryLabel(product.category)}
        </div>
        <h1 className="font-serif text-3xl font-bold text-white md:text-4xl">
          {product.title}
        </h1>
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-3xl text-gold">
            {formatPrice(product.price)}
          </span>
          {product.oldPrice && product.oldPrice > product.price && (
            <>
              <span className="text-white/40 line-through">
                {formatPrice(product.oldPrice)}
              </span>
              <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-bold text-red-200">
                -{discount}%
              </span>
            </>
          )}
        </div>
        <p className="leading-relaxed text-white/70">{product.description}</p>

        <ul className="mt-2 grid grid-cols-2 gap-2 text-sm text-white/70">
          <li className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/5">🚚 توصيل لجميع الولايات</li>
          <li className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/5">✅ ضمان الجودة</li>
          <li className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/5">💳 الدفع عند الاستلام</li>
          <li className="rounded-xl bg-white/[0.03] p-3 ring-1 ring-white/5">💬 دعم 24/7</li>
        </ul>

        <ProductActions product={product} />
      </div>
    </section>
  );
}
