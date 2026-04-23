import { notFound } from "next/navigation";
import { CATEGORIES, categoryLabel, type CategoryId } from "@/lib/config";
import { getSeedCatalog } from "@/products";
import { ProductGrid } from "@/components/shop/ProductGrid";

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const known = CATEGORIES.find((c) => c.id === category);
  return known ? { title: known.ar } : {};
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const id = category as CategoryId;
  if (!CATEGORIES.some((c) => c.id === id)) notFound();

  const all = getSeedCatalog();
  const products = all.filter((p) => p.category === id);

  return <ProductGrid title={categoryLabel(id)} products={products} />;
}
