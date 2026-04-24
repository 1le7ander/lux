import { NextResponse } from "next/server";
import { endAdminSession } from "@/server/auth";

export const runtime = "nodejs";

export async function POST() {
  await endAdminSession();
  return NextResponse.json({ success: true });
}
