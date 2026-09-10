import { CONDITIONS } from "@/lib/constants";
import type { Condition, NewProduct } from "@/db/schema";

type ParseResult =
  | { ok: true; data: Omit<NewProduct, "id" | "createdAt"> }
  | { ok: false; error: string };

function toInt(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function toStr(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

export function parseProductInput(raw: unknown): ParseResult {
  const b = (raw ?? {}) as Record<string, unknown>;

  const name = toStr(b.name);
  const brand = toStr(b.brand);
  const model = toStr(b.model);
  const price = toInt(b.price);
  const originalPrice = b.originalPrice === "" || b.originalPrice == null ? null : toInt(b.originalPrice);
  const condition = toStr(b.condition).toUpperCase() as Condition;
  const stock = toInt(b.stock) ?? 0;
  const processor = toStr(b.processor);
  const ram = toStr(b.ram);
  const storage = toStr(b.storage);
  const gpu = toStr(b.gpu);
  const display = toStr(b.display);
  const battery = toStr(b.battery) || null;
  const description = toStr(b.description);
  const warranty = toStr(b.warranty) || "1 Month DLS Service Warranty";
  const featured = Boolean(b.featured);
  const images = Array.isArray(b.images)
    ? b.images.map((i) => toStr(i)).filter(Boolean).slice(0, 8)
    : [];

  if (name.length < 3) return { ok: false, error: "Product name is required (min 3 characters)." };
  if (!brand) return { ok: false, error: "Brand is required." };
  if (!model) return { ok: false, error: "Model is required." };
  if (price == null || price <= 0) return { ok: false, error: "Price must be a positive number." };
  if (originalPrice != null && originalPrice <= 0) return { ok: false, error: "Original price must be positive." };
  if (!CONDITIONS.includes(condition as (typeof CONDITIONS)[number]))
    return { ok: false, error: "Invalid condition value." };
  if (stock < 0) return { ok: false, error: "Stock cannot be negative." };
  if (!processor) return { ok: false, error: "Processor is required." };
  if (!ram) return { ok: false, error: "RAM is required." };
  if (!storage) return { ok: false, error: "Storage is required." };
  if (!gpu) return { ok: false, error: "GPU / graphics is required." };
  if (!display) return { ok: false, error: "Display info is required." };
  if (description.length < 10) return { ok: false, error: "Description is required (min 10 characters)." };
  if (!images.length) return { ok: false, error: "Add at least one product image (upload or paste a URL)." };

  return {
    ok: true,
    data: {
      name,
      brand,
      model,
      price: price!,
      originalPrice,
      condition,
      stock,
      processor,
      ram,
      storage,
      gpu,
      display,
      battery,
      description,
      warranty,
      images,
      featured,
    },
  };
}
