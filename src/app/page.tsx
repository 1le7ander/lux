import { getSeedCatalog } from "@/products";
import { Hero } from "@/components/shop/Hero";
import { CategoryGrid } from "@/components/shop/CategoryGrid";
import { ProductGrid } from "@/components/shop/ProductGrid";

export default function HomePage() {
  const products = getSeedCatalog();
  const counts = products.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
  const trending = products.slice(0, 8);

  return (
    <>
      <Hero />
      <CategoryGrid counts={counts} />
      <ProductGrid title="المنتجات الرائجة" products={trending} />
    </>
  );
}
