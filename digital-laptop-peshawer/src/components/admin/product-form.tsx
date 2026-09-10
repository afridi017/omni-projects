"use client";

import { useRef, useState } from "react";
import { CloudUpload, ImagePlus, Link2, Loader2, Save, X } from "lucide-react";
import { BRANDS, CONDITIONS } from "@/lib/constants";
import { CONDITION_LABELS, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export type ProductDraft = {
  name: string;
  brand: string;
  model: string;
  price: string;
  originalPrice: string;
  condition: string;
  stock: string;
  processor: string;
  ram: string;
  storage: string;
  gpu: string;
  display: string;
  battery: string;
  description: string;
  warranty: string;
  featured: boolean;
  images: string[];
};

export const emptyProductDraft: ProductDraft = {
  name: "",
  brand: "Apple",
  model: "",
  price: "",
  originalPrice: "",
  condition: "NEW",
  stock: "1",
  processor: "",
  ram: "",
  storage: "",
  gpu: "",
  display: "",
  battery: "",
  description: "",
  warranty: "1 Month DLS Service Warranty",
  featured: false,
  images: [],
};

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET ?? "";
const CLOUD_READY = Boolean(CLOUD_NAME && UPLOAD_PRESET);

async function uploadToCloudinary(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("upload_preset", UPLOAD_PRESET);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: fd,
  });
  if (!res.ok) throw new Error("Cloudinary upload failed");
  const data = (await res.json()) as { secure_url?: string };
  if (!data.secure_url) throw new Error("No URL returned");
  return data.secure_url;
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label>{label}</Label>
      {children}
    </div>
  );
}

export function ProductForm({
  editingId,
  initial,
  authedFetch,
  onSaved,
  onCancel,
}: {
  editingId: number | null;
  initial: ProductDraft;
  authedFetch: (url: string, init?: RequestInit) => Promise<Response>;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState<ProductDraft>(initial);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setError("");
    for (const file of Array.from(files).slice(0, 8)) {
      setUploading((n) => n + 1);
      try {
        const url = await uploadToCloudinary(file);
        setDraft((d) => ({ ...d, images: [...d.images, url].slice(0, 8) }));
      } catch {
        setError("Image upload failed. Check your Cloudinary credentials or paste an image URL instead.");
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (fileRef.current) fileRef.current.value = "";
  }

  function addUrl() {
    const url = urlInput.trim();
    if (!url) return;
    setDraft((d) => ({ ...d, images: [...d.images, url].slice(0, 8) }));
    setUrlInput("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...draft,
        price: Number(draft.price),
        originalPrice: draft.originalPrice ? Number(draft.originalPrice) : null,
        stock: Number(draft.stock || 0),
      };
      const res = await authedFetch(
        editingId ? `/api/products/${editingId}` : "/api/products",
        { method: editingId ? "PATCH" : "POST", body: JSON.stringify(payload) },
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not save the product.");
        return;
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="mx-auto max-w-4xl p-6 sm:p-8">
      <h2 className="font-display text-xl font-bold text-white">
        {editingId ? `Edit Laptop #${editingId}` : "Add New Laptop"}
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Fields marked * are required. Images are uploaded to Cloudinary or added by URL.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Identity */}
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Product Name *" className="sm:col-span-2">
            <Input value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Dell XPS 15 9530 OLED" />
          </Field>
          <Field label="Brand *">
            <Select value={draft.brand} onChange={(e) => set("brand", e.target.value)}>
              {BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
            </Select>
          </Field>
          <Field label="Model *">
            <Input value={draft.model} onChange={(e) => set("model", e.target.value)} placeholder="e.g. XPS 9530" />
          </Field>
          <Field label="Condition *">
            <Select value={draft.condition} onChange={(e) => set("condition", e.target.value)}>
              {CONDITIONS.map((c) => <option key={c} value={c}>{CONDITION_LABELS[c]}</option>)}
            </Select>
          </Field>
          <Field label="Stock *">
            <Input type="number" min={0} value={draft.stock} onChange={(e) => set("stock", e.target.value)} />
          </Field>
        </div>

        {/* Pricing */}
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="Price (PKR) *">
            <Input type="number" min={1} value={draft.price} onChange={(e) => set("price", e.target.value)} placeholder="185000" />
          </Field>
          <Field label="Original Price (PKR)">
            <Input type="number" min={0} value={draft.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} placeholder="Optional — shows a discount" />
          </Field>
          <Field label="Warranty">
            <Input value={draft.warranty} onChange={(e) => set("warranty", e.target.value)} />
          </Field>
        </div>

        {/* Specs */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Processor *">
            <Input value={draft.processor} onChange={(e) => set("processor", e.target.value)} placeholder="e.g. Intel Core i7-13700H (13th Gen)" />
          </Field>
          <Field label="RAM *">
            <Input value={draft.ram} onChange={(e) => set("ram", e.target.value)} placeholder="e.g. 16GB DDR5" />
          </Field>
          <Field label="Storage *">
            <Input value={draft.storage} onChange={(e) => set("storage", e.target.value)} placeholder="e.g. 512GB NVMe SSD" />
          </Field>
          <Field label="Graphics (GPU) *">
            <Input value={draft.gpu} onChange={(e) => set("gpu", e.target.value)} placeholder="e.g. NVIDIA RTX 4060 8GB" />
          </Field>
          <Field label="Display *">
            <Input value={draft.display} onChange={(e) => set("display", e.target.value)} placeholder='e.g. 15.6" FHD 120Hz IPS' />
          </Field>
          <Field label="Battery">
            <Input value={draft.battery} onChange={(e) => set("battery", e.target.value)} placeholder="e.g. 4–5 hrs backup, 86Wh" />
          </Field>
        </div>

        {/* Images */}
        <div className="space-y-3">
          <Label>Product Images * (up to 8)</Label>
          <div
            onClick={() => CLOUD_READY && fileRef.current?.click()}
            className={cn(
              "rounded-2xl border border-dashed border-white/15 bg-white/[0.02] px-6 py-8 text-center transition-colors",
              CLOUD_READY ? "cursor-pointer hover:border-cyan-400/40 hover:bg-cyan-400/[0.03]" : "opacity-80",
            )}
          >
            <CloudUpload className="mx-auto h-8 w-8 text-zinc-500" />
            {CLOUD_READY ? (
              <>
                <p className="mt-3 text-sm font-medium text-zinc-200">
                  Click to upload from your device
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Uploaded securely to Cloudinary ({CLOUD_NAME}) — PNG / JPG / WebP
                </p>
                {uploading > 0 && (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-cyan-300">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading {uploading} image{uploading > 1 ? "s" : ""}...
                  </p>
                )}
              </>
            ) : (
              <p className="mt-3 text-sm text-zinc-400">
                Cloudinary is not configured yet (set{" "}
                <code className="text-cyan-300">NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME</code> and{" "}
                <code className="text-cyan-300">NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> in <code className="text-cyan-300">.env</code>).
                Paste image URLs below instead.
              </p>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link2 className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://... paste image URL"
                className="pl-10"
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrl(); } }}
              />
            </div>
            <Button type="button" variant="outline" onClick={addUrl}>
              <ImagePlus className="h-4 w-4" /> Add URL
            </Button>
          </div>

          {draft.images.length > 0 && (
            <div className="flex flex-wrap gap-3 pt-1">
              {draft.images.map((url, i) => (
                <div key={url + i} className="group relative h-20 w-28 overflow-hidden rounded-xl border border-white/10 bg-[#0a0c12]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-cyan-200">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setDraft((d) => ({ ...d, images: d.images.filter((_, x) => x !== i) }))}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-zinc-300 opacity-0 transition-opacity hover:text-red-300 group-hover:opacity-100"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <Field label="Description *">
          <Textarea
            rows={5}
            value={draft.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Condition details, what's included, battery health, anything the buyer should know..."
          />
        </Field>

        {/* Featured */}
        <button
          type="button"
          onClick={() => set("featured", !draft.featured)}
          className={cn(
            "flex w-full items-center justify-between rounded-2xl border p-5 text-left transition-all",
            draft.featured
              ? "border-amber-400/40 bg-amber-400/[0.07]"
              : "border-white/10 bg-white/[0.02] hover:border-white/20",
          )}
        >
          <span>
            <span className="block text-sm font-semibold text-white">Feature on homepage</span>
            <span className="mt-0.5 block text-xs text-zinc-500">
              Featured laptops appear in the homepage &quot;Featured Laptops&quot; section.
            </span>
          </span>
          <span
            className={cn(
              "relative h-7 w-12 shrink-0 rounded-full transition-colors",
              draft.featured ? "bg-amber-400/80" : "bg-white/10",
            )}
          >
            <span
              className={cn(
                "absolute top-1 h-5 w-5 rounded-full bg-white transition-all",
                draft.featured ? "left-6" : "left-1",
              )}
            />
          </span>
        </button>

        {error && (
          <p className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 border-t border-white/10 pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="accent" size="lg" disabled={saving || uploading > 0}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {editingId ? "Save Changes" : "Publish Laptop"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
