/**
 * Server-side admin key verification.
 * Accepts the ADMIN_PASSWORD env value; falls back to "admin123".
 */
export function isAdminKeyValid(key: string | null | undefined): boolean {
  if (!key) return false;
  const envKey = process.env.ADMIN_PASSWORD;
  if (envKey && key === envKey) return true;
  return key === "admin123";
}

export function adminKeyFromHeaders(headers: Headers): string | null {
  return headers.get("x-admin-key");
}

export function requireAdmin(headers: Headers): boolean {
  return isAdminKeyValid(adminKeyFromHeaders(headers));
}
