import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import {
  buildSiteConfig,
  DEFAULT_SETTINGS,
  readSettings,
  writeSettings,
} from "@/lib/settings";

/** GET — full site config (any admin can read it). */
export async function GET(request: Request) {
  if (!(await requireAdmin(request.headers))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const map = await readSettings();
  return NextResponse.json({ config: buildSiteConfig(map), raw: map });
}

/** PATCH — update one or more editable settings. */
export async function PATCH(request: Request) {
  if (!(await requireAdmin(request.headers))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as Record<
    string,
    unknown
  > | null;
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Invalid settings payload." },
      { status: 400 },
    );
  }

  // Whitelist to the known editable keys.
  const allowed = Object.keys(DEFAULT_SETTINGS);
  const updates: Record<string, string> = {};
  for (const key of Object.keys(body)) {
    if (!allowed.includes(key)) continue;
    const value = body[key];
    if (typeof value === "string") updates[key] = value.trim().slice(0, 2000);
  }
  if (!Object.keys(updates).length) {
    return NextResponse.json(
      { error: "No valid settings to save." },
      { status: 400 },
    );
  }

  await writeSettings(updates);
  return NextResponse.json({
    ok: true,
    config: buildSiteConfig(await readSettings()),
  });
}
