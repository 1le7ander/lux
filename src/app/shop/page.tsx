import { getSeedCatalog } from "@/products";
import { ProductGrid } from "@/components/shop/ProductGrid";

export const metadata = { title: "المتجر" };

export default function ShopIndexPage() {
  return <ProductGrid title="كل المنتجات" products={getSeedCatalog()} />;
}
