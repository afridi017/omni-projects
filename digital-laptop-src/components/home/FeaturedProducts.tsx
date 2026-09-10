import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/products/ProductCard";

export default async function FeaturedProducts() {
  let products = [];
  try {
    products = await prisma.product.findMany({
      where: { featured: true, stock: { gt: 0 } },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
  } catch (e) {
    // If DB not connected yet, return empty
    console.error("DB not connected:", e);
  }

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-end justify-between mb-10">
        <div>
          <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider mb-2">Hand-Picked For You</p>
          <h2 className="text-white text-3xl sm:text-4xl font-bold">Featured Laptops</h2>
        </div>
        <Link
          href="/products"
          id="view-all-featured"
          className="hidden sm:flex items-center gap-2 text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200 group"
        >
          View All
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-800 flex items-center justify-center">
            <span className="text-2xl">💻</span>
          </div>
          <p className="text-slate-400">Featured laptops will appear here once added.</p>
          <Link href="/admin/products/new" className="mt-4 inline-block text-blue-400 hover:text-blue-300 text-sm">
            Add products from Admin →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Mobile view all */}
      <div className="sm:hidden mt-8 text-center">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium"
        >
          View All Laptops <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
