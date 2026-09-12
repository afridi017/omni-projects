import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { SHOP } from "@/lib/constants";

/* ------------------------------------------------------------------ *
 * Table bootstrap
 * ------------------------------------------------------------------ */

const CREATE_SETTINGS_TABLE = sql`
  create table if not exists "settings" (
    "key" text primary key,
    "value" text not null,
    "updated_at" timestamp with time zone not null default now()
  )
`;

let tableReady: Promise<void> | null = null;

function ensureTable(): Promise<void> {
  if (tableReady) return tableReady;
  const pending: Promise<void> = db
    .execute(CREATE_SETTINGS_TABLE)
    .then(() => undefined);
  tableReady = pending;
  pending.catch(() => {
    // Allow a later request to retry the bootstrap after a transient failure.
    tableReady = null;
  });
  return pending;
}

/* ------------------------------------------------------------------ *
 * Raw key/value access
 * ------------------------------------------------------------------ */

export type SettingsMap = Record<string, string>;

/** Reads every stored setting. Returns an empty map when the DB is unreachable. */
export async function readSettings(): Promise<SettingsMap> {
  try {
    await ensureTable();
    const rows = await db.select().from(settings);
    return Object.fromEntries(rows.map((row) => [row.key, row.value]));
  } catch {
    return {};
  }
}

/** Reads a single setting, or null when it is missing / the DB is unreachable. */
export async function readSetting(key: string): Promise<string | null> {
  try {
    await ensureTable();
    const rows = await db
      .select({ value: settings.value })
      .from(settings)
      .where(eq(settings.key, key))
      .limit(1);
    return rows[0]?.value ?? null;
  } catch {
    return null;
  }
}

/** Upserts one or more settings. Throws when the write fails. */
export async function writeSettings(entries: SettingsMap): Promise<void> {
  const keys = Object.keys(entries);
  if (!keys.length) return;
  await ensureTable();
  await db
    .insert(settings)
    .values(keys.map((key) => ({ key, value: entries[key] })))
    .onConflictDoUpdate({
      target: settings.key,
      set: {
        value: sql`excluded."value"`,
        updatedAt: sql`excluded."updated_at"`,
      },
    });
}

export async function deleteSetting(key: string): Promise<void> {
  await ensureTable();
  await db.delete(settings).where(eq(settings.key, key));
}

/* ------------------------------------------------------------------ *
 * Editable site settings
 * ------------------------------------------------------------------ */

export const DEFAULT_SETTINGS = {
  site_name: SHOP.name,
  tagline: SHOP.tagline,
  logo_url: "/images/logo.png",
  phone_owner: SHOP.phoneOwner,
  phone_display: SHOP.phoneDisplay,
  whatsapp_number: "923109516681",
  address: SHOP.address,
  map_embed: SHOP.mapEmbed,
  opening_hours: "Mon – Sat · 10:00 AM – 9:00 PM",
  hero_badge: "Alharmian Market · Near Gull Haji Plaza · Peshawar",
  hero_title: "Premium Laptops.",
  hero_title_accent: "Honest Prices.",
  hero_subtitle:
    "Hand-picked new & imported machines, fully tested by our service lab, with Cash on Delivery across Peshawar.",
  hero_image_url: "/images/hero-laptop.svg",
  service_image_url: "/images/service-desk.svg",
  service_title: "Software Installation & Hardware Service",
  service_description:
    "Windows & licensed software installation, data recovery, SSD/RAM upgrades, screen & battery replacement and board-level repairs — all under one roof.",
  service_phone_display: SHOP.phoneDisplay,
  footer_note:
    "Peshawar's trusted destination for premium new & imported laptops — checked, tested and serviced by experts.",
} as const;

export type SettingKey = keyof typeof DEFAULT_SETTINGS;

export const EDITABLE_SETTING_KEYS = Object.keys(
  DEFAULT_SETTINGS,
) as SettingKey[];

export const SETTING_LABELS: Record<SettingKey, string> = {
  site_name: "Shop name",
  tagline: "Tagline",
  logo_url: "Logo",
  phone_owner: "Owner name",
  phone_display: "Phone (display)",
  whatsapp_number: "WhatsApp number",
  address: "Shop address",
  map_embed: "Google Maps embed URL",
  opening_hours: "Opening hours",
  hero_badge: "Hero badge",
  hero_title: "Hero headline",
  hero_title_accent: "Hero headline (accent line)",
  hero_subtitle: "Hero paragraph",
  hero_image_url: "Hero image",
  service_image_url: "Service section image",
  service_title: "Service title",
  service_description: "Service description",
  service_phone_display: "Service phone (display)",
  footer_note: "Footer note",
};

/* ------------------------------------------------------------------ *
 * Derived helpers
 * ------------------------------------------------------------------ */

function onlyDigits(value: string): string {
  return value.replace(/\D+/g, "");
}

/** "0310-9516681" -> "tel:+923109516681" */
export function telHref(display: string): string {
  let digits = onlyDigits(display);
  if (digits.startsWith("0")) digits = `92${digits.slice(1)}`;
  return `tel:+${digits}`;
}

/** "0310-9516681" or "923109516681" -> "https://wa.me/923109516681" */
export function whatsappHref(number: string): string {
  let digits = onlyDigits(number);
  if (digits.startsWith("0")) digits = `92${digits.slice(1)}`;
  return `https://wa.me/${digits}`;
}

/* ------------------------------------------------------------------ *
 * Public site config
 * ------------------------------------------------------------------ */

export type SiteConfig = {
  siteName: string;
  tagline: string;
  logoUrl: string;
  phoneOwner: string;
  phoneDisplay: string;
  phoneTel: string;
  whatsappNumber: string;
  whatsapp: string;
  address: string;
  mapEmbed: string;
  openingHours: string;
  heroBadge: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  heroImageUrl: string;
  serviceImageUrl: string;
  serviceTitle: string;
  serviceDescription: string;
  servicePhoneDisplay: string;
  footerNote: string;
};

function pick(map: SettingsMap, key: SettingKey): string {
  const raw = map[key];
  return raw && raw.trim() ? raw.trim() : DEFAULT_SETTINGS[key];
}

export function buildSiteConfig(map: SettingsMap): SiteConfig {
  const phoneDisplay = pick(map, "phone_display");
  const whatsappNumber = pick(map, "whatsapp_number");
  return {
    siteName: pick(map, "site_name"),
    tagline: pick(map, "tagline"),
    logoUrl: pick(map, "logo_url"),
    phoneOwner: pick(map, "phone_owner"),
    phoneDisplay,
    phoneTel: telHref(phoneDisplay),
    whatsappNumber,
    whatsapp: whatsappHref(whatsappNumber),
    address: pick(map, "address"),
    mapEmbed: pick(map, "map_embed"),
    openingHours: pick(map, "opening_hours"),
    heroBadge: pick(map, "hero_badge"),
    heroTitle: pick(map, "hero_title"),
    heroTitleAccent: pick(map, "hero_title_accent"),
    heroSubtitle: pick(map, "hero_subtitle"),
    heroImageUrl: pick(map, "hero_image_url"),
    serviceImageUrl: pick(map, "service_image_url"),
    serviceTitle: pick(map, "service_title"),
    serviceDescription: pick(map, "service_description"),
    servicePhoneDisplay: pick(map, "service_phone_display"),
    footerNote: pick(map, "footer_note"),
  };
}

/** Full site configuration for rendering the storefront. Never throws. */
export async function getSiteConfig(): Promise<SiteConfig> {
  return buildSiteConfig(await readSettings());
}

/* ------------------------------------------------------------------ *
 * Validation
 * ------------------------------------------------------------------ */

export type SettingsParseResult =
  | { ok: true; data: SettingsMap }
  | { ok: false; error: string };

const MAX_VALUE_LENGTH = 2000;

export function parseSettingsInput(raw: unknown): SettingsParseResult {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return { ok: false, error: "Invalid settings payload." };
  }
  const body = raw as Record<string, unknown>;
  const data: SettingsMap = {};

  for (const key of EDITABLE_SETTING_KEYS) {
    if (!(key in body)) continue;
    const value = body[key];
    if (typeof value !== "string") {
      return { ok: false, error: `"${SETTING_LABELS[key]}" must be text.` };
    }
    data[key] = value.trim().slice(0, MAX_VALUE_LENGTH);
  }

  const required: SettingKey[] = [
    "site_name",
    "tagline",
    "phone_display",
    "whatsapp_number",
    "address",
    "service_title",
    "service_description",
  ];

  for (const key of required) {
    if (key in data && !data[key]) {
      return { ok: false, error: `"${SETTING_LABELS[key]}" cannot be empty.` };
    }
  }

  if (data.whatsapp_number && onlyDigits(data.whatsapp_number).length < 10) {
    return { ok: false, error: "WhatsApp number looks too short." };
  }

  if (data.phone_display && onlyDigits(data.phone_display).length < 10) {
    return { ok: false, error: "Phone number looks too short." };
  }

  if (data.map_embed && !/^https?:\/\//i.test(data.map_embed)) {
    return {
      ok: false,
      error: "Google Maps embed URL must start with http:// or https://.",
    };
  }

  return { ok: true, data };
}
