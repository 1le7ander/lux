import { NextResponse } from "next/server";
import { orderSchema } from "@/orders/schema";
import { isAdminAuthed } from "@/server/auth";
import * as appsScript from "@/server/apps-script";
import { env } from "@/server/env";

export const runtime = "nodejs";

/**
 * GET  /api/orders?admin=1 → admin listing (requires cookie)
 * POST /api/orders         → customer order submission
 */

export async function GET(req: Request) {
  const url = new URL(req.url);
  const isAdmin = url.searchParams.get("admin") === "1";

  if (!isAdmin) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!env.APPS_SCRIPT_URL) {
    // Local-dev fallback: return empty list
    return NextResponse.json({ success: true, items: [] });
  }
  try {
    const items = await appsScript.listOrders();
    return NextResponse.json({ success: true, items });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 502 }
    );
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid order",
      },
      { status: 422 }
    );
  }

  const order = parsed.data;

  if (!env.APPS_SCRIPT_URL) {
    // Local dev: accept but don't forward
    return NextResponse.json({ success: true, offline: true });
  }

  try {
    await appsScript.saveOrder(order);
    return NextResponse.json({ success: true, order });
  } catch (err) {
    // Don't fail the customer — log and accept locally. Admin will see
    // the gap in the Sheet and can reconcile from their localStorage
    // mirror if needed.
    console.error("saveOrder error:", err);
    return NextResponse.json({ success: true, degraded: true });
  }
}
