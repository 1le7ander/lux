/**
 * Public, client-safe config. Anything secret lives only on the server —
 * see src/server/env.ts.
 */

export const SITE = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "LUXE",
  tagline: "أزياء راقية تعكس شخصيتك",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "213555000000",
  email: process.env.NEXT_PUBLIC_EMAIL ?? "heamtan126@gmail.com",
  freeShippingOver: 3000,
} as const;

export const CATEGORIES = [
  { id: "men", emoji: "👔", ar: "ملابس رجالية", en: "Men" },
  { id: "women", emoji: "👗", ar: "ملابس نسائية", en: "Women" },
  { id: "kids", emoji: "🧒", ar: "الأطفال", en: "Kids" },
  { id: "accessories", emoji: "💍", ar: "الإكسسوارات", en: "Accessories" },
  { id: "shoes", emoji: "👟", ar: "الأحذية", en: "Shoes" },
  { id: "perfumes", emoji: "🌹", ar: "العطور", en: "Perfumes" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export function categoryLabel(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.ar ?? id;
}
