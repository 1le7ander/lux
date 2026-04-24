/**
 * Thin JSON-RPC style client for the Google Apps Script web app.
 *
 * SERVER-ONLY helpers live in src/server/apps-script.ts — they add the
 * shared ADMIN_KEY automatically. This file contains the shape/types that
 * both sides of the network agree on.
 */

export type AppsScriptResponse<T = unknown> =
  | ({ success: true } & T)
  | { success: false; error: string };

export type UploadResponse = AppsScriptResponse<{
  url: string;
  fileId: string;
}>;

export type ProductsResponse = AppsScriptResponse<{
  items: RawProduct[];
}>;

export type OrdersResponse = AppsScriptResponse<{
  items: RawOrder[];
}>;

export interface RawProduct {
  id: string;
  title: string;
  category: string;
  price: number;
  oldPrice?: number | null;
  image: string;
  gallery?: string[];
  description?: string;
  stock?: number;
  createdAt?: string;
}

export interface RawOrder {
  id: string;
  createdAt: string;
  status: "new" | "confirmed" | "shipped" | "delivered" | "cancelled";
  name: string;
  phone: string;
  wilaya: string;
  commune: string;
  notes?: string;
  items: Array<{ id: string; title: string; qty: number; price: number }>;
  subtotal: number;
  shipping: number;
  total: number;
}
