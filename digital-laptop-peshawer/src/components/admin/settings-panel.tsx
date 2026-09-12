"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
  CloudUpload,
  ImagePlus,
  ImageIcon,
  KeyRound,
  Loader2,
  Save,
  Settings,
  Store,
} from "lucide-react";
import type { SiteConfig } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SiteSettingsPanelProps = {
  authedFetch: (url: string, init?: RequestInit) => Promise<Response>;
};

/** Mapping of settings field → label + type */
const FIELDS: {
  key: keyof SiteConfig;
  label: string;
  group: string;
  type?: "textarea" | "url" | "tel";
  hint?: string;
}[] = [
  // General
  { key: "siteName", label: "Shop Name", group: "General" },
  { key: "tagline", label: "Tagline", group: "General" },
  { key: "phoneOwner", label: "Owner Name", group: "Contact" },
  {
    key: "phoneDisplay",
    label: "Phone (Display)",
    group: "Contact",
    type: "tel",
  },
  {
    key: "whatsappNumber",
    label: "WhatsApp Number (with 92)",
    group: "Contact",
    type: "tel",
  },
  { key: "address", label: "Shop Address", group: "Contact", type: "textarea" },
  {
    key: "mapEmbed",
    label: "Google Maps Embed URL",
    group: "Contact",
    type: "url",
  },
  { key: "openingHours", label: "Opening Hours", group: "General" },
  // Hero
  {
    key: "heroBadge",
    label: "Hero Badge (top pill)",
    group: "Hero Section",
    hint: 'e.g. "Alharmian Market · Near Gull Haji Plaza · Peshawar"',
  },
  { key: "heroTitle", label: "Hero Headline", group: "Hero Section" },
  { key: "heroTitleAccent", label: "Hero Accent Line", group: "Hero Section" },
  {
    key: "heroSubtitle",
    label: "Hero Paragraph",
    group: "Hero Section",
    type: "textarea",
  },
  {
    key: "heroImageUrl",
    label: "Hero Image URL",
    group: "Hero Section",
    type: "url",
  },
  // Service section
  {
    key: "serviceImageUrl",
    label: "Service Section Image URL",
    group: "Service Section",
    type: "url",
  },
  {
    key: "serviceTitle",
    label: "Service Section Title",
    group: "Service Section",
  },
  {
    key: "serviceDescription",
    label: "Service Section Description",
    group: "Service Section",
    type: "textarea",
  },
  {
    key: "servicePhoneDisplay",
    label: "Service Book Phone",
    group: "Service Section",
    type: "tel",
  },
  // Footer
  {
    key: "footerNote",
    label: "Footer Note",
    group: "Footer",
    type: "textarea",
  },
];

const RAW_KEYS: Record<keyof SiteConfig, string> = {
  siteName: "site_name",
  tagline: "tagline",
  logoUrl: "logo_url",
  phoneOwner: "phone_owner",
  phoneDisplay: "phone_display",
  whatsappNumber: "whatsapp_number",
  phoneTel: "phone_tel",
  whatsapp: "whatsapp",
  address: "address",
  mapEmbed: "map_embed",
  openingHours: "opening_hours",
  heroBadge: "hero_badge",
  heroTitle: "hero_title",
  heroTitleAccent: "hero_title_accent",
  heroSubtitle: "hero_subtitle",
  heroImageUrl: "hero_image_url",
  serviceImageUrl: "service_image_url",
  serviceTitle: "service_title",
  serviceDescription: "service_description",
  servicePhoneDisplay: "service_phone_display",
  footerNote: "footer_note",
};

export function SettingsPanel({ authedFetch }: SiteSettingsPanelProps) {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{
    ok: boolean;
    text: string;
  } | null>(null);

  // Image upload state
  const [uploadingKey, setUploadingKey] = useState<keyof SiteConfig | null>(
    null,
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useState<Record<string, HTMLInputElement | null>>({})[0];

  useEffect(() => {
    authedFetch("/api/admin/settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setConfig(data.config))
      .catch(() => setError("Could not load settings."));
  }, [authedFetch]);

  const set =
    (key: keyof SiteConfig) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setConfig((c) => (c ? { ...c, [key]: e.target.value } : c));
    };

  async function saveSettings() {
    if (!config) return;
    setSaving(true);
    setSaved(false);
    setError("");
    try {
      const payload: Record<string, string> = {};
      for (const field of FIELDS) {
        payload[RAW_KEYS[field.key]] = String(config[field.key] ?? "");
      }
      const res = await authedFetch("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save settings.");
        return;
      }
      setConfig(data.config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    setPasswordMsg(null);
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ ok: false, text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMsg({
        ok: false,
        text: "New password must be at least 6 characters.",
      });
      return;
    }
    setChangingPassword(true);
    try {
      const res = await authedFetch("/api/admin/password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPasswordMsg({
          ok: false,
          text: data.error ?? "Could not change password.",
        });
        return;
      }
      setPasswordMsg({
        ok: true,
        text: data.message ?? "Password changed successfully.",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMsg({
        ok: false,
        text: err instanceof Error ? err.message : "Something went wrong.",
      });
    } finally {
      setChangingPassword(false);
    }
  }

  async function uploadImageFor(key: keyof SiteConfig, file: File) {
    setUploading(true);
    setUploadingKey(key);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await authedFetch("/api/admin/upload", {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }
      setConfig((c) => (c ? { ...c, [key]: data.url } : c));
    } catch {
      setError("Upload failed. Paste the image URL instead.");
    } finally {
      setUploading(false);
      setUploadingKey(null);
    }
  }

  const groups = [...new Set(FIELDS.map((f) => f.group))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2.5 font-display text-lg font-semibold text-white">
              <Settings className="h-5 w-5 text-cyan-300" /> Site Settings
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Control the homepage, service section, badges, contact info —
              everything updates instantly on the storefront.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {saved && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                <Check className="h-3.5 w-3.5" /> Saved
              </span>
            )}
            <Button
              variant="accent"
              onClick={saveSettings}
              disabled={saving || !config}
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save All
            </Button>
          </div>
        </div>
        {error && (
          <p className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}
      </Card>

      {!config ? (
        <Card className="flex items-center justify-center p-16 text-zinc-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading settings...
        </Card>
      ) : (
        groups.map((group) => (
          <Card key={group} className="p-6">
            <h3 className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              <Store className="h-4 w-4 text-cyan-300/70" /> {group}
            </h3>
            <div className="grid gap-5 sm:grid-cols-2">
              {FIELDS.filter((f) => f.group === group).map((field) => {
                const isImage =
                  field.key === "heroImageUrl" ||
                  field.key === "serviceImageUrl";
                return (
                  <div
                    key={field.key}
                    className={cn("space-y-2", isImage && "sm:col-span-2")}
                  >
                    <Label>{field.label}</Label>

                    {isImage ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#0a0c12]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={config[field.key] as string}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div className="flex flex-1 items-center gap-2">
                            <input
                              ref={(el) => {
                                fileInputRef[field.key] = el;
                              }}
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadImageFor(field.key, file);
                                e.target.value = "";
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={uploading}
                              onClick={() => fileInputRef[field.key]?.click()}
                            >
                              {uploading && uploadingKey === field.key ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <CloudUpload className="h-3.5 w-3.5" />
                              )}
                              Upload
                            </Button>
                            <Input
                              value={String(config[field.key] ?? "")}
                              onChange={set(field.key)}
                              placeholder="https://... image URL"
                              className="flex-1"
                            />
                          </div>
                        </div>
                        {field.hint && (
                          <p className="text-xs text-zinc-600">{field.hint}</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        {field.type === "textarea" ? (
                          <Textarea
                            rows={3}
                            value={String(config[field.key] ?? "")}
                            onChange={set(field.key)}
                            placeholder={field.label}
                          />
                        ) : (
                          <Input
                            type={
                              field.type === "tel"
                                ? "tel"
                                : field.type === "url"
                                  ? "url"
                                  : "text"
                            }
                            value={String(config[field.key] ?? "")}
                            onChange={set(field.key)}
                            placeholder={field.label}
                          />
                        )}
                        {field.hint && (
                          <p className="mt-1 text-xs text-zinc-600">
                            {field.hint}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        ))
      )}

      {/* Password change */}
      <Card className="p-6">
        <h3 className="mb-5 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          <KeyRound className="h-4 w-4 text-cyan-300/70" /> Security — Change
          Admin Password
        </h3>
        <div className="grid gap-5 sm:grid-cols-3">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current password"
            />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min 6 characters"
            />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <div className="flex gap-2">
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
              />
              <Button
                variant="outline"
                onClick={changePassword}
                disabled={
                  changingPassword ||
                  !currentPassword ||
                  !newPassword ||
                  !confirmPassword
                }
                className="shrink-0"
              >
                {changingPassword ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <KeyRound className="h-4 w-4" />
                )}
                Update
              </Button>
            </div>
          </div>
        </div>
        {passwordMsg && (
          <p
            className={cn(
              "mt-4 rounded-2xl border px-4 py-3 text-sm",
              passwordMsg.ok
                ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-200"
                : "border-red-400/30 bg-red-500/10 text-red-200",
            )}
          >
            {passwordMsg.text}
          </p>
        )}
        <p className="mt-4 text-xs text-zinc-600">
          After changing the password you will be logged out and need to sign in
          again.
        </p>
      </Card>

      {/* Image upload help */}
      <Card className="p-6">
        <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          <ImageIcon className="h-4 w-4 text-cyan-300/70" /> Images
        </h3>
        <p className="text-sm text-zinc-400">
          Upload images directly to Cloudinary (signed uploads — the API secret
          stays on the server). You can also paste any image URL (e.g. from
          Google Images) in the fields above.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-3 text-xs text-zinc-500">
          <ImagePlus className="h-4 w-4 text-cyan-300/70" />
          The hero image and service section image are stored in the settings
          and shown on the homepage.
        </div>
      </Card>
    </div>
  );
}
