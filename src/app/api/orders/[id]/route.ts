import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/server/auth";
import { updateOrderStatus } from "@/server/apps-script";
import { env } from "@/server/env";
import type { OrderStatus } from "@/orders/types";

export const runtime = "nodejs";

const VALID: OrderStatus[] = [
  "new",
  "confirmed",
  "shipped",
  "delivered",
  "cancelled",
];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!(await isAdminAuthed())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  const body = (await req.json().catch(() => ({}))) as {
    status?: OrderStatus;
  };
  if (!body.status || !VALID.includes(body.status)) {
    return NextResponse.json(
      { success: false, error: "Invalid status" },
      { status: 422 }
    );
  }
  if (!env.APPS_SCRIPT_URL) {
    return NextResponse.json({ success: true, offline: true });
  }
  try {
    await updateOrderStatus(id, body.status);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 502 }
    );
  }
}
