/**
 * All 58 Algerian wilayas with numeric code, Latin name, and Arabic name.
 * Tuples: [number, english, arabic]
 */

export type Wilaya = readonly [number, string, string];

export const WILAYAS: readonly Wilaya[] = [
  [1, "Adrar", "أدرار"],
  [2, "Chlef", "الشلف"],
  [3, "Laghouat", "الأغواط"],
  [4, "Oum El Bouaghi", "أم البواقي"],
  [5, "Batna", "باتنة"],
  [6, "Béjaïa", "بجاية"],
  [7, "Biskra", "بسكرة"],
  [8, "Béchar", "بشار"],
  [9, "Blida", "البليدة"],
  [10, "Bouira", "البويرة"],
  [11, "Tamanrasset", "تمنراست"],
  [12, "Tébessa", "تبسة"],
  [13, "Tlemcen", "تلمسان"],
  [14, "Tiaret", "تيارت"],
  [15, "Tizi Ouzou", "تيزي وزو"],
  [16, "Alger", "الجزائر"],
  [17, "Djelfa", "الجلفة"],
  [18, "Jijel", "جيجل"],
  [19, "Sétif", "سطيف"],
  [20, "Saïda", "سعيدة"],
  [21, "Skikda", "سكيكدة"],
  [22, "Sidi Bel Abbès", "سيدي بلعباس"],
  [23, "Annaba", "عنابة"],
  [24, "Guelma", "قالمة"],
  [25, "Constantine", "قسنطينة"],
  [26, "Médéa", "المدية"],
  [27, "Mostaganem", "مستغانم"],
  [28, "M'Sila", "المسيلة"],
  [29, "Mascara", "معسكر"],
  [30, "Ouargla", "ورقلة"],
  [31, "Oran", "وهران"],
  [32, "El Bayadh", "البيض"],
  [33, "Illizi", "إليزي"],
  [34, "Bordj Bou Arreridj", "برج بوعريريج"],
  [35, "Boumerdès", "بومرداس"],
  [36, "El Tarf", "الطارف"],
  [37, "Tindouf", "تندوف"],
  [38, "Tissemsilt", "تيسمسيلت"],
  [39, "El Oued", "الوادي"],
  [40, "Khenchela", "خنشلة"],
  [41, "Souk Ahras", "سوق أهراس"],
  [42, "Tipaza", "تيبازة"],
  [43, "Mila", "ميلة"],
  [44, "Aïn Defla", "عين الدفلى"],
  [45, "Naâma", "النعامة"],
  [46, "Aïn Témouchent", "عين تموشنت"],
  [47, "Ghardaïa", "غرداية"],
  [48, "Relizane", "غليزان"],
  [49, "Timimoun", "تيميمون"],
  [50, "Bordj Badji Mokhtar", "برج باجي مختار"],
  [51, "Ouled Djellal", "أولاد جلال"],
  [52, "Béni Abbès", "بني عباس"],
  [53, "In Salah", "عين صالح"],
  [54, "In Guezzam", "عين قزام"],
  [55, "Touggourt", "تقرت"],
  [56, "Djanet", "جانت"],
  [57, "El M'Ghair", "المغير"],
  [58, "El Meniaa", "المنيعة"],
] as const;

/** Shipping fees by wilaya number (DZD). Home-delivery tier. */
export const SHIPPING_BY_WILAYA: Record<number, number> = Object.fromEntries(
  WILAYAS.map(([n]) => {
    // Algiers + coastal neighbors are cheapest; south more expensive.
    if ([16, 35, 9, 42, 15].includes(n)) return [n, 400];
    if ([2, 6, 10, 19, 25, 26, 31, 43].includes(n)) return [n, 500];
    if ([3, 11, 33, 37, 39, 47, 53, 54, 56].includes(n)) return [n, 900];
    return [n, 600];
  })
);

export function shippingFor(wilayaEn: string | null | undefined): number {
  if (!wilayaEn) return 0;
  const w = WILAYAS.find(([, en]) => en.toLowerCase() === wilayaEn.toLowerCase());
  return w ? SHIPPING_BY_WILAYA[w[0]] : 600;
}
