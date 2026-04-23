import "server-only";

import { env } from "./env";
import type {
  AppsScriptResponse,
  OrdersResponse,
  ProductsResponse,
  RawProduct,
  UploadResponse,
} from "@/lib/apps-script";
import type { Order } from "@/orders/types";

/**
 * Server-side client for the Apps Script web app.
 *
 * All mutating calls include `key: ADMIN_KEY` automatically. Callers must
 * never forward the raw request body from the browser — always construct
 * a sanitized payload here.
 */

async function rpc<T>(action: string, body: Record<string, unknown> = {}): Promise<T> {
  if (!env.APPS_SCRIPT_URL) {
    throw new Error("APPS_SCRIPT_URL is not configured");
  }

  const res = await fetch(env.APPS_SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...body }),
    // Apps Script web apps don't support cache control; disable caching.
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Apps Script returned HTTP ${res.status}`);
  }

  const json = (await res.json()) as AppsScriptResponse<T>;
  if (!json.success) {
    throw new Error(json.error || "Apps Script error");
  }
  return json as T;
}

/** Upload a base64 image to Drive via Apps Script. */
export async function uploadImage(params: {
  filename: string;
  base64: string;
}): Promise<{ url: string; fileId: string }> {
  const out = await rpc<UploadResponse>("uploadImage", {
    key: env.ADMIN_KEY,
    filename: params.filename,
    base64: params.base64,
  });
  // Type narrow — rpc throws on !success, so this is the success branch.
  if (!("url" in out) || typeof out.url !== "string") {
    throw new Error("Apps Script upload response missing url");
  }
  return { url: out.url, fileId: out.fileId };
}

export async function listProducts(): Promise<RawProduct[]> {
  const out = await rpc<ProductsResponse>("listProducts");
  return "items" in out ? out.items : [];
}

export async function saveProduct(product: RawProduct): Promise<void> {
  await rpc("saveProduct", { key: env.ADMIN_KEY, product });
}

export async function deleteProduct(id: string): Promise<void> {
  await rpc("deleteProduct", { key: env.ADMIN_KEY, id });
}

export async function listOrders(): Promise<Order[]> {
  const out = await rpc<OrdersResponse>("listOrders", { key: env.ADMIN_KEY });
  if (!("items" in out)) return [];
  return out.items.map((raw) => ({
    id: raw.id,
    createdAt: raw.createdAt,
    status: raw.status,
    customer: {
      name: raw.name,
      phone: raw.phone,
      wilaya: raw.wilaya,
      commune: raw.commune,
      notes: raw.notes,
    },
    items: raw.items,
    subtotal: Number(raw.subtotal) || 0,
    shipping: Number(raw.shipping) || 0,
    total: Number(raw.total) || 0,
  }));
}

export async function saveOrder(order: Order): Promise<void> {
  await rpc("saveOrder", { order });
}

export async function updateOrderStatus(
  id: string,
  status: Order["status"]
): Promise<void> {
  await rpc("updateOrderStatus", { key: env.ADMIN_KEY, id, status });
}
