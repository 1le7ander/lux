import { z } from "zod";

export const productSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(2),
  category: z.enum(["men", "women", "kids", "accessories", "shoes", "perfumes"]),
  price: z.number().int().nonnegative(),
  oldPrice: z.number().int().nonnegative().nullable().optional(),
  image: z.string().url(),
  gallery: z.array(z.string().url()).optional(),
  description: z.string().optional(),
  badge: z.string().optional(),
  stock: z.number().int().nonnegative().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;
