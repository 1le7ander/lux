import { z } from "zod";

export const orderItemSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  qty: z.number().int().positive(),
  price: z.number().int().nonnegative(),
  image: z.string().url().optional(),
});

export const customerSchema = z.object({
  name: z.string().min(2, "الاسم قصير جداً"),
  phone: z
    .string()
    .regex(/^(05|06|07)\d{8}$/, "رقم هاتف غير صحيح (يبدأ بـ 05/06/07)"),
  wilaya: z.string().min(1, "يرجى اختيار الولاية"),
  commune: z.string().min(2, "البلدية قصيرة جداً"),
  notes: z.string().max(500).optional(),
});

export const orderSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string(),
  status: z.enum(["new", "confirmed", "shipped", "delivered", "cancelled"]),
  customer: customerSchema,
  items: z.array(orderItemSchema).min(1, "السلة فارغة"),
  subtotal: z.number().int().nonnegative(),
  shipping: z.number().int().nonnegative(),
  total: z.number().int().nonnegative(),
});

export type CustomerInput = z.infer<typeof customerSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
