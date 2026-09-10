import { Suspense } from "react";
import type { Metadata } from "next";
import { Laptop, SearchX } from "lucide-react";
import { getDistinctBrands, getProducts, type ProductFilters } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";
import { ShopFilters } from "@/components/shop-filters";
import { Skeleton } from "@/components/ui/skeleton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop Laptops",
  description:
    "Browse premium new & imported laptops at DIGITAL LAPTOP Peshawar — Apple, Dell, HP, Lenovo, ASUS, MSI. Filter by brand, condition, RAM and price. Cash on Delivery available.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function GridSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[4/4.6] rounded-3xl" />
      ))}
    </div>
  );
}

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const get = (key: string): string | undefined => {
    const v = params[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const filters: ProductFilters = {
    brand: get("brand"),
    condition: get("condition"),
    ram: get("ram"),
    minPrice: get("minPrice") ? Number(get("minPrice")) : undefined,
    maxPrice: get("maxPrice") ? Number(get("maxPrice")) : undefined,
    search: get("q"),
    sort: get("sort"),
  };

  const [products, brands] = await Promise.all([
    getProducts(filters).catch(() => []),
    getDistinctBrands().catch(() => []),
  ]);

  return (
    <div className="relative">
      <div className="hero-glow absolute inset-x-0 top-0 h-[420px]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <header className="mb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            The Collection
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Shop <span className="text-gradient">Laptops</span>
          </h1>
          <p className="mt-4 max-w-2xl text-zinc-400">
            Every machine is lab-tested by DLS before listing. Filter by brand,
            condition, RAM and budget — Cash on Delivery available in Peshawar.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <Suspense fallback={<Skeleton className="h-[480px] rounded-3xl" />}>
            <ShopFilters brands={brands} resultCount={products.length} />
          </Suspense>

          <div>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-zinc-500">
                <span className="font-semibold text-white">{products.length}</span>{" "}
                {products.length === 1 ? "laptop" : "laptops"} found
              </p>
            </div>

            {products.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="glass-panel flex flex-col items-center gap-4 rounded-3xl px-6 py-20 text-center">
                <SearchX className="h-10 w-10 text-zinc-600" />
                <h3 className="font-display text-xl font-semibold text-white">
                  No laptops match your filters
                </h3>
                <p className="max-w-sm text-sm text-zinc-400">
                  Try widening the price range or clearing a filter — or message
                  us on WhatsApp and we&apos;ll source it for you.
                </p>
                <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                  <Laptop className="h-4 w-4" /> New stock arrives weekly
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
