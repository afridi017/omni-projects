import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { deleteSetting, readSetting, writeSettings } from "@/lib/settings";

/**
 * Admin authentication.
 *
 * The panel password lives in the database (`admin_password_hash`) once it has
 * been changed from the admin panel; until then the ADMIN_PASSWORD environment
 * variable (or "admin123") is used. Sessions are stateless HMAC-signed tokens,
 * so the raw password is never sent on every request.
 */

export const DEFAULT_ADMIN_PASSWORD = "admin123";
export const MIN_PASSWORD_LENGTH = 6;

const PASSWORD_HASH_KEY = "admin_password_hash";
const SESSION_SECRET_KEY = "session_secret";
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const SCRYPT_KEYLEN = 64;
const SCRYPT_PREFIX = "scrypt";

/* ------------------------------------------------------------------ *
 * Password hashing
 * ------------------------------------------------------------------ */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return `${SCRYPT_PREFIX}$${salt}$${derived}`;
}

export function verifyPasswordHash(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 3 || parts[0] !== SCRYPT_PREFIX) return false;
  const salt = parts[1];
  const expectedHex = parts[2];
  if (!salt || !expectedHex) return false;
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN);
  const expected = Buffer.from(expectedHex, "hex");
  if (expected.length !== derived.length) return false;
  return timingSafeEqual(derived, expected);
}

function safeEquals(a: string, b: string): boolean {
  const left = Buffer.from(a, "utf8");
  const right = Buffer.from(b, "utf8");
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** True once the panel password has been changed away from the env default. */
export async function hasCustomPassword(): Promise<boolean> {
  return (await readSetting(PASSWORD_HASH_KEY)) !== null;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  if (!password) return false;
  const stored = await readSetting(PASSWORD_HASH_KEY);
  if (stored) return verifyPasswordHash(password, stored);
  const envPassword =
    process.env.ADMIN_PASSWORD?.trim() || DEFAULT_ADMIN_PASSWORD;
  return safeEquals(password, envPassword);
}

export async function setAdminPassword(password: string): Promise<void> {
  await writeSettings({ [PASSWORD_HASH_KEY]: hashPassword(password) });
}

/** Reverts the panel back to the ADMIN_PASSWORD environment variable. */
export async function resetPasswordToEnv(): Promise<void> {
  await deleteSetting(PASSWORD_HASH_KEY);
}

/* ------------------------------------------------------------------ *
 * Session tokens
 * ------------------------------------------------------------------ */

async function sessionSecret(): Promise<string> {
  const stored = await readSetting(SESSION_SECRET_KEY);
  if (stored) return stored;

  const envSecret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (envSecret) return envSecret;

  const generated = randomBytes(32).toString("hex");
  try {
    await writeSettings({ [SESSION_SECRET_KEY]: generated });
    return generated;
  } catch {
    // Database unavailable — fall back to a stable process-wide secret.
    return process.env.ADMIN_PASSWORD?.trim() || DEFAULT_ADMIN_PASSWORD;
  }
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

/** Issues a token valid for {@link TOKEN_TTL_SECONDS}. */
export async function createSessionToken(): Promise<string> {
  const expiresAt = Date.now() + TOKEN_TTL_SECONDS * 1000;
  const payload = String(expiresAt);
  return `${payload}.${sign(payload, await sessionSecret())}`;
}

export async function verifySessionToken(
  token: string | null | undefined,
): Promise<boolean> {
  if (!token) return false;
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return false;
  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) return false;
  return safeEquals(signature, sign(payload, await sessionSecret()));
}

/** Invalidates every previously issued token (used after a password change). */
export async function rotateSessionSecret(): Promise<void> {
  await writeSettings({
    [SESSION_SECRET_KEY]: randomBytes(32).toString("hex"),
  });
}

/* ------------------------------------------------------------------ *
 * Request guard
 * ------------------------------------------------------------------ */

export function adminTokenFromHeaders(headers: Headers): string | null {
  const key = headers.get("x-admin-key");
  if (key) return key.trim();
  const auth = headers.get("authorization");
  if (auth?.toLowerCase().startsWith("bearer ")) return auth.slice(7).trim();
  return null;
}

export async function requireAdmin(headers: Headers): Promise<boolean> {
  return verifySessionToken(adminTokenFromHeaders(headers));
}
