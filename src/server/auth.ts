import "server-only";

import { createHash, createHmac, timingSafeEqual } from "crypto";
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

/**
 * Session tokens are HMAC-signed payloads of the form:
 *
 *   <expiresAtMs>.<hmac-sha256(expiresAtMs, signingKey)>
 *
 * The signing key is derived from the admin password hash (which only the
 * server knows) mixed with a static domain separator. This means:
 *   - A cookie value with a missing/invalid HMAC is rejected.
 *   - An expired cookie is rejected even if the HMAC matches.
 *   - Rotating ADMIN_PASS_HASH invalidates all issued sessions.
 *   - If ADMIN_PASS_HASH is not configured, **no** session is ever valid —
 *     see `credsConfigured()` below.
 */
function credsConfigured(): boolean {
  return Boolean(env.ADMIN_USER_HASH && env.ADMIN_PASS_HASH);
}

function signingKey(): string {
  // Callers must check credsConfigured() before signing / verifying.
  return `luxe|session|v1|${env.ADMIN_PASS_HASH}`;
}

function sign(payload: string): string {
  return createHmac("sha256", signingKey()).update(payload).digest("hex");
}

export async function startAdminSession(): Promise<void> {
  if (!credsConfigured()) {
    throw new Error("admin credentials not configured");
  }
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000;
  const payload = String(expiresAt);
  const token = `${payload}.${sign(payload)}`;
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
  // If the credential env vars are not configured, the signing key would
  // collapse to a known/weak value — reject every session in that case so a
  // misconfigured deployment cannot be exploited with a forged cookie.
  if (!credsConfigured()) return false;

  const store = await cookies();
  const c = store.get(COOKIE_NAME);
  if (!c?.value) return false;

  const dot = c.value.indexOf(".");
  if (dot <= 0) return false;

  const payload = c.value.slice(0, dot);
  const mac = c.value.slice(dot + 1);

  // Constant-time signature check.
  const expected = sign(payload);
  if (!safeEqual(mac, expected)) return false;

  // Reject expired tokens.
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}
