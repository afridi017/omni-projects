"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { RotateCcw, Search, SlidersHorizontal } from "lucide-react";
import { CONDITION_LABELS, cn } from "@/lib/utils";
import { CONDITIONS, RAM_OPTIONS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const PRICE_PRESETS = [
  { label: "Under Rs. 100k", min: "", max: "100000" },
  { label: "Rs. 100k – 200k", min: "100000", max: "200000" },
  { label: "Rs. 200k – 350k", min: "200000", max: "350000" },
  { label: "Above Rs. 350k", min: "350000", max: "" },
];

function toggleValue(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-300",
        active
          ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.15)]"
          : "border-white/10 bg-white/5 text-zinc-400 hover:border-white/25 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

export function ShopFilters({
  brands,
  resultCount,
}: {
  brands: string[];
  resultCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [mobileOpen, setMobileOpen] = useState(false);

  const current = {
    q: searchParams.get("q") ?? "",
    brand: (searchParams.get("brand") ?? "").split(",").filter(Boolean),
    condition: (searchParams.get("condition") ?? "").split(",").filter(Boolean),
    ram: (searchParams.get("ram") ?? "").split(",").filter(Boolean),
    minPrice: searchParams.get("minPrice") ?? "",
    maxPrice: searchParams.get("maxPrice") ?? "",
    sort: searchParams.get("sort") ?? "newest",
  };

  const [query, setQuery] = useState(current.q);
  useEffect(() => setQuery(current.q), [current.q]);

  const push = (patch: Record<string, string>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(patch)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    if (!("sort" in patch)) params.delete("__ts");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (query !== current.q) push({ q: query });
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const activePreset = PRICE_PRESETS.findIndex(
    (p) => p.min === current.minPrice && p.max === current.maxPrice,
  );

  const hasFilters =
    current.q ||
    current.brand.length ||
    current.condition.length ||
    current.ram.length ||
    current.minPrice ||
    current.maxPrice;

  const panel = (
    <div className="space-y-7">
      <div>
        <Label className="mb-2.5 block">Search</Label>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="MacBook, RTX 4060, i7..."
            className="pl-10"
          />
        </div>
      </div>

      <div>
        <Label className="mb-2.5 block">Sort By</Label>
        <Select value={current.sort} onChange={(e) => push({ sort: e.target.value === "newest" ? "" : e.target.value })}>
          <option value="newest">Newest first</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name A–Z</option>
        </Select>
      </div>

      <div>
        <Label className="mb-2.5 block">Brand</Label>
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <Chip
              key={brand}
              active={current.brand.includes(brand)}
              onClick={() => push({ brand: toggleValue(current.brand, brand).join(",") })}
            >
              {brand}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2.5 block">Condition</Label>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((c) => (
            <Chip
              key={c}
              active={current.condition.includes(c)}
              onClick={() => push({ condition: toggleValue(current.condition, c).join(",") })}
            >
              {CONDITION_LABELS[c]}
            </Chip>
          ))}
        </div>
      </div>

      <div>
        <Label className="mb-2.5 block">Price Range (PKR)</Label>
        <div className="flex flex-wrap gap-2">
          {PRICE_PRESETS.map((preset, i) => (
            <Chip
              key={preset.label}
              active={activePreset === i}
              onClick={() =>
                push(
                  activePreset === i
                    ? { minPrice: "", maxPrice: "" }
                    : { minPrice: preset.min, maxPrice: preset.max },
                )
              }
            >
              {preset.label}
            </Chip>
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={current.minPrice}
            onChange={(e) => push({ minPrice: e.target.value })}
          />
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={current.maxPrice}
            onChange={(e) => push({ maxPrice: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label className="mb-2.5 block">RAM</Label>
        <div className="flex flex-wrap gap-2">
          {RAM_OPTIONS.map((ram) => (
            <Chip
              key={ram}
              active={current.ram.includes(ram)}
              onClick={() => push({ ram: toggleValue(current.ram, ram).join(",") })}
            >
              {ram}
            </Chip>
          ))}
        </div>
      </div>

      {hasFilters ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => {
            setQuery("");
            startTransition(() => router.replace(pathname, { scroll: false }));
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" /> Clear all filters
        </Button>
      ) : null}
    </div>
  );

  return (
    <aside>
      <div className="mb-4 lg:hidden">
        <Button
          variant="outline"
          className="w-full justify-between"
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </span>
          <span className="text-xs text-zinc-500">{resultCount} results</span>
        </Button>
      </div>
      {mobileOpen && (
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl lg:hidden">
          {panel}
        </div>
      )}
      <div className="sticky top-24 hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl lg:block">
        {panel}
      </div>
    </aside>
  );
}
