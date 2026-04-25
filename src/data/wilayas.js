/**
 * 58 Algerian provinces (wilayas) with delivery pricing.
 */

const wilayas = [
  { code: '01', name: 'أدرار', fee: 900 },
  { code: '02', name: 'الشلف', fee: 700 },
  { code: '03', name: 'الأغواط', fee: 800 },
  { code: '04', name: 'أم البواقي', fee: 700 },
  { code: '05', name: 'باتنة', fee: 700 },
  { code: '06', name: 'بجاية', fee: 600 },
  { code: '07', name: 'بسكرة', fee: 800 },
  { code: '08', name: 'بشار', fee: 900 },
  { code: '09', name: 'البليدة', fee: 500 },
  { code: '10', name: 'البويرة', fee: 600 },
  { code: '11', name: 'تمنراست', fee: 900 },
  { code: '12', name: 'تبسة', fee: 800 },
  { code: '13', name: 'تلمسان', fee: 700 },
  { code: '14', name: 'تيارت', fee: 700 },
  { code: '15', name: 'تيزي وزو', fee: 600 },
  { code: '16', name: 'الجزائر', fee: 500 },
  { code: '17', name: 'الجلفة', fee: 700 },
  { code: '18', name: 'جيجل', fee: 700 },
  { code: '19', name: 'سطيف', fee: 600 },
  { code: '20', name: 'سعيدة', fee: 700 },
  { code: '21', name: 'سكيكدة', fee: 700 },
  { code: '22', name: 'سيدي بلعباس', fee: 700 },
  { code: '23', name: 'عنابة', fee: 700 },
  { code: '24', name: 'قالمة', fee: 700 },
  { code: '25', name: 'قسنطينة', fee: 600 },
  { code: '26', name: 'المدية', fee: 600 },
  { code: '27', name: 'مستغانم', fee: 700 },
  { code: '28', name: 'المسيلة', fee: 700 },
  { code: '29', name: 'معسكر', fee: 700 },
  { code: '30', name: 'ورقلة', fee: 800 },
  { code: '31', name: 'وهران', fee: 600 },
  { code: '32', name: 'البيض', fee: 800 },
  { code: '33', name: 'إليزي', fee: 900 },
  { code: '34', name: 'برج بوعريريج', fee: 700 },
  { code: '35', name: 'بومرداس', fee: 500 },
  { code: '36', name: 'الطارف', fee: 700 },
  { code: '37', name: 'تندوف', fee: 900 },
  { code: '38', name: 'تيسمسيلت', fee: 700 },
  { code: '39', name: 'الوادي', fee: 800 },
  { code: '40', name: 'خنشلة', fee: 800 },
  { code: '41', name: 'سوق أهراس', fee: 700 },
  { code: '42', name: 'تيبازة', fee: 500 },
  { code: '43', name: 'ميلة', fee: 700 },
  { code: '44', name: 'عين الدفلى', fee: 600 },
  { code: '45', name: 'النعامة', fee: 800 },
  { code: '46', name: 'عين تيموشنت', fee: 700 },
  { code: '47', name: 'غرداية', fee: 800 },
  { code: '48', name: 'غليزان', fee: 700 },
  { code: '49', name: 'تيميمون', fee: 900 },
  { code: '50', name: 'برج باجي مختار', fee: 900 },
  { code: '51', name: 'أولاد جلال', fee: 800 },
  { code: '52', name: 'بني عباس', fee: 900 },
  { code: '53', name: 'عين صالح', fee: 900 },
  { code: '54', name: 'عين قزام', fee: 900 },
  { code: '55', name: 'توقرت', fee: 800 },
  { code: '56', name: 'جانت', fee: 900 },
  { code: '57', name: 'المغير', fee: 800 },
  { code: '58', name: 'المنيعة', fee: 800 },
];

export default wilayas;

/** Get delivery fee for a wilaya code */
export function getDeliveryFee(code) {
  const w = wilayas.find((w) => w.code === code);
  return w ? w.fee : 600;
}

/** Search wilayas by name */
export function searchWilayas(query) {
  if (!query) return wilayas;
  const q = query.trim().toLowerCase();
  return wilayas.filter((w) =>
    w.name.includes(q) || w.code.includes(q)
  );
}
