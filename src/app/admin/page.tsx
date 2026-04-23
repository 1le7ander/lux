import { redirect } from "next/navigation";
import { isAdminAuthed } from "@/server/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = { title: "لوحة الإدارة" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthed())) redirect("/admin/login");
  return <AdminShell />;
}
