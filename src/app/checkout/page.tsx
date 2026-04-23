import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata = { title: "إتمام الشراء" };

export default function CheckoutPage() {
  return (
    <section className="container-luxe py-10">
      <h1 className="mb-6 font-serif text-3xl text-white md:text-4xl">
        إتمام الشراء
      </h1>
      <CheckoutForm />
    </section>
  );
}
