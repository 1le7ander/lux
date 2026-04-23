import type { CategoryId } from "@/lib/config";

export interface Product {
  id: string;
  title: string;
  category: CategoryId;
  price: number;
  oldPrice?: number | null;
  image: string;
  gallery?: string[];
  description?: string;
  badge?: string;
  stock?: number;
}
