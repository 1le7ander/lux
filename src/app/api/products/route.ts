import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/server/auth";
import * as appsScript from "@/server/apps-script";
import { env } from "@/server/env";
import { getSeedCatalog } from "@/products";
import { productSchema } from "@/products/schema";
import type { Product } from "@/products/types";

export const runtime = "nodejs";

/**
 * GET  /api/products → public catalog
 *   - Combines the Apps Script catalog with the seed catalog so the
 *     storefront always has something to show during local dev.
 * POST /api/products → admin upsert (requires session)
 */

export async function GET() {
  const seed = getSeedCatalog();
  if (!env.APPS_SCRIPT_URL) {
    return NextResponse.json({ success: true, items: seed, source: "seed" });
  }
  try {
    const remote = await appsScript.listProducts();
    if (remote.length === 0) {
      return NextResponse.json({
        success: true,
        items: seed,
        source: "seed-fallback",
      });
    }
    return NextResponse.json({
      success: true,
      items: remote as Product[],
      source: "sheets",
    });
  } catch {
    return NextResponse.json({
      success: true,
      items: seed,
      source: "seed-fallback",
    });
  }
}

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
  const body = (await req.json().catch(() => null)) as Product | null;
  if (!body) {
    return NextResponse.json(
      { success: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Invalid product",
      },
      { status: 422 }
    );
  }
  if (!env.APPS_SCRIPT_URL) {
    return NextResponse.json({ success: true, offline: true });
  }
  try {
    await appsScript.saveProduct({
      id: parsed.data.id,
      title: parsed.data.title,
      category: parsed.data.category,
      price: parsed.data.price,
      oldPrice: parsed.data.oldPrice ?? null,
      image: parsed.data.image,
      gallery: parsed.data.gallery ?? [],
      description: parsed.data.description ?? "",
      stock: parsed.data.stock ?? 0,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 502 }
    );
  }
}
