import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/server/auth";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "تسجيل الدخول" };

export default async function AdminLoginPage() {
  if (await isAdminAuthed()) redirect("/admin");
  return (
    <section className="container-luxe flex min-h-[70vh] items-center justify-center py-10">
      <LoginForm />
    </section>
  );
}
