import seedCatalog from "@data/products.json";
import type { Product } from "./types";

export function getSeedCatalog(): Product[] {
  return seedCatalog as Product[];
}

export function findSeedProduct(id: string): Product | undefined {
  return getSeedCatalog().find((p) => p.id === id);
}
