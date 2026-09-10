"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const BRANDS = ["Dell", "HP", "Lenovo", "Apple", "Asus", "Acer", "Samsung", "MSI", "Toshiba", "Sony"];
const CONDITIONS = [
  { value: "NEW", label: "Brand New" },
  { value: "LIKE_NEW", label: "Like New" },
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
];
const RAM_OPTIONS = ["4GB", "8GB", "12GB", "16GB", "32GB", "64GB"];

interface ProductFiltersProps {
  totalCount: number;
}

export default function ProductFilters({ totalCount }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [priceMin, setPriceMin] = useState(searchParams.get("minPrice") || "");
  const [priceMax, setPriceMax] = useState(searchParams.get("maxPrice") || "");

  const selectedBrands = searchParams.getAll("brand");
  const selectedConditions = searchParams.getAll("condition");
  const selectedRAMs = searchParams.getAll("ram");
  const search = searchParams.get("search") || "";

  function updateFilters(key: string, value: string, multi = false) {
    const params = new URLSearchParams(searchParams.toString());
    if (multi) {
      const current = params.getAll(key);
      if (current.includes(value)) {
        params.delete(key);
        current.filter((v) => v !== value).forEach((v) => params.append(key, v));
      } else {
        params.append(key, value);
      }
    } else {
      if (params.get(key) === value) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.push(`/products?${params.toString()}`);
  }

  function handleSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set("search", value);
    else params.delete("search");
    router.push(`/products?${params.toString()}`);
  }

  function applyPriceRange() {
    const params = new URLSearchParams(searchParams.toString());
    if (priceMin) params.set("minPrice", priceMin);
    else params.delete("minPrice");
    if (priceMax) params.set("maxPrice", priceMax);
    else params.delete("maxPrice");
    router.push(`/products?${params.toString()}`);
  }

  function clearAll() {
    router.push("/products");
    setPriceMin("");
    setPriceMax("");
  }

  const hasFilters = selectedBrands.length > 0 || selectedConditions.length > 0 || selectedRAMs.length > 0 || search || priceMin || priceMax;

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Search</label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            id="product-search"
            placeholder="Search laptops..."
            defaultValue={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50 focus:bg-white/8 transition-all duration-200"
          />
        </div>
      </div>

      {/* Brand */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Brand</label>
        <div className="flex flex-wrap gap-2">
          {BRANDS.map((brand) => (
            <button
              key={brand}
              id={`filter-brand-${brand.toLowerCase()}`}
              onClick={() => updateFilters("brand", brand, true)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border",
                selectedBrands.includes(brand)
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                  : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white"
              )}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Condition</label>
        <div className="space-y-2">
          {CONDITIONS.map((c) => (
            <button
              key={c.value}
              id={`filter-condition-${c.value.toLowerCase()}`}
              onClick={() => updateFilters("condition", c.value, true)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 border",
                selectedConditions.includes(c.value)
                  ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                  : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white"
              )}
            >
              <span>{c.label}</span>
              {selectedConditions.includes(c.value) && <X className="w-3 h-3" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Price Range (PKR)</label>
        <div className="flex gap-2">
          <input
            type="number"
            id="price-min"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50 transition-all duration-200"
          />
          <input
            type="number"
            id="price-max"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/50 transition-all duration-200"
          />
        </div>
        <button
          id="apply-price-filter"
          onClick={applyPriceRange}
          className="w-full py-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 text-sm font-medium hover:bg-blue-500/20 transition-all duration-200"
        >
          Apply Price Filter
        </button>
      </div>

      {/* RAM */}
      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">RAM</label>
        <div className="flex flex-wrap gap-2">
          {RAM_OPTIONS.map((ram) => (
            <button
              key={ram}
              id={`filter-ram-${ram}`}
              onClick={() => updateFilters("ram", ram, true)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 border",
                selectedRAMs.includes(ram)
                  ? "bg-purple-500/20 text-purple-400 border-purple-500/40"
                  : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white"
              )}
            >
              {ram}
            </button>
          ))}
        </div>
      </div>

      {/* Clear filters */}
      {hasFilters && (
        <button
          id="clear-all-filters"
          onClick={clearAll}
          className="w-full py-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 text-sm font-medium hover:bg-red-500/20 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <X className="w-4 h-4" />
          Clear All Filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-72 flex-shrink-0">
        <div className="sticky top-24 p-5 rounded-2xl bg-slate-900/60 border border-white/8 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              <span className="text-white font-semibold text-sm">Filters</span>
            </div>
            <span className="text-slate-500 text-xs">{totalCount} laptops</span>
          </div>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <div className="lg:hidden">
        <button
          id="mobile-filter-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:border-white/20 transition-all duration-200"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasFilters && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
          <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", mobileOpen && "rotate-180")} />
        </button>

        {mobileOpen && (
          <div className="mt-3 p-5 rounded-2xl bg-slate-900/90 border border-white/10 backdrop-blur-xl">
            <FilterContent />
          </div>
        )}
      </div>
    </>
  );
}
