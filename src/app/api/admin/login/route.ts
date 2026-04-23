import { NextResponse } from "next/server";
import { startAdminSession, verifyAdminCredentials } from "@/server/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const { user, pass } = (await req.json()) as { user?: string; pass?: string };
  if (!user || !pass) {
    return NextResponse.json(
      { success: false, error: "بيانات ناقصة" },
      { status: 400 }
    );
  }
  if (!verifyAdminCredentials(user, pass)) {
    return NextResponse.json(
      { success: false, error: "بيانات دخول غير صحيحة" },
      { status: 401 }
    );
  }
  await startAdminSession();
  return NextResponse.json({ success: true });
}
