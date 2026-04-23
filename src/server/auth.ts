import "server-only";

import { createHash, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { env } from "./env";

const COOKIE_NAME = "luxe_admin";
const SESSION_TTL_SECONDS = 60 * 60 * 4; // 4h

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqual(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export function verifyAdminCredentials(user: string, pass: string): boolean {
  if (!env.ADMIN_USER_HASH || !env.ADMIN_PASS_HASH) return false;
  const userOk = safeEqual(sha256(user), env.ADMIN_USER_HASH);
  const passOk = safeEqual(sha256(pass), env.ADMIN_PASS_HASH);
  return userOk && passOk;
}

export async function startAdminSession(): Promise<void> {
  const token = sha256(`${Date.now()}-${env.ADMIN_PASS_HASH}`);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function endAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function isAdminAuthed(): Promise<boolean> {
  const store = await cookies();
  const c = store.get(COOKIE_NAME);
  return Boolean(c?.value);
}
