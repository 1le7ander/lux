import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata = { title: "إتمام الشراء" };

export default function CheckoutPage() {
  return (
    <section className="container-luxe py-8 sm:py-12">
      <header className="mb-6 sm:mb-8">
        <h1 className="h-section">إتمام الشراء</h1>
        <p className="h-section-sub">خطوة أخيرة — املأ بياناتك وسنتواصل لتأكيد الطلب</p>
        <div className="mt-3 h-px w-16 bg-gradient-to-l from-gold to-transparent" />
      </header>
      <CheckoutForm />
    </section>
  );
}
