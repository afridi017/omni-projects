import { Suspense } from "react";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import ProductFilters from "@/components/products/ProductFilters";
import { Product } from "@/types";

export const metadata: Metadata = {
  title: "Browse Laptops | DIGITAL LAPTOP Peshawar",
  description: "Browse our full collection of new and refurbished laptops. Filter by brand, condition, price, and RAM.",
};

interface SearchParams {
  brand?: string | string[];
  condition?: string | string[];
  ram?: string | string[];
  minPrice?: string;
  maxPrice?: string;
  search?: string;
}

async function getProducts(searchParams: SearchParams): Promise<Product[]> {
  const where: any = {};

  const brands = searchParams.brand ? (Array.isArray(searchParams.brand) ? searchParams.brand : [searchParams.brand]) : [];
  const conditions = searchParams.condition ? (Array.isArray(searchParams.condition) ? searchParams.condition : [searchParams.condition]) : [];
  const rams = searchParams.ram ? (Array.isArray(searchParams.ram) ? searchParams.ram : [searchParams.ram]) : [];

  if (brands.length > 0) where.brand = { in: brands };
  if (conditions.length > 0) where.condition = { in: conditions };
  if (rams.length > 0) where.ram = { in: rams };
  if (searchParams.minPrice || searchParams.maxPrice) {
    where.price = {};
    if (searchParams.minPrice) where.price.gte = parseFloat(searchParams.minPrice);
    if (searchParams.maxPrice) where.price.lte = parseFloat(searchParams.maxPrice);
  }
  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      { brand: { contains: searchParams.search, mode: "insensitive" } },
      { model: { contains: searchParams.search, mode: "insensitive" } },
      { processor: { contains: searchParams.search, mode: "insensitive" } },
    ];
  }

  try {
    return await prisma.product.findMany({ where, orderBy: { createdAt: "desc" } }) as unknown as Product[];
  } catch {
    return [];
  }
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
  const products = await getProducts(searchParams);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16">
        {/* Header */}
        <div className="border-b border-white/5 bg-slate-950">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-white">Browse Laptops</h1>
            <p className="text-slate-400 mt-1">Find your perfect laptop from our curated collection</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Filters sidebar */}
            <Suspense fallback={null}>
              <ProductFilters totalCount={products.length} />
            </Suspense>

            {/* Products grid */}
            <div className="flex-1 min-w-0">
              {products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="w-20 h-20 mb-6 rounded-3xl bg-slate-800/60 flex items-center justify-center text-4xl">
                    🔍
                  </div>
                  <h2 className="text-white text-xl font-semibold mb-2">No laptops found</h2>
                  <p className="text-slate-400 text-sm max-w-sm">
                    Try adjusting your filters or search terms to find what you&apos;re looking for.
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <p className="text-slate-400 text-sm">
                      <span className="text-white font-semibold">{products.length}</span> laptops found
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
