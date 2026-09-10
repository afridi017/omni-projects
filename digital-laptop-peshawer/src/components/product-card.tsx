import Link from "next/link";
import { Cpu, HardDrive, MemoryStick } from "lucide-react";
import type { Product } from "@/db/schema";
import { cn, formatPKR } from "@/lib/utils";
import { ConditionBadge } from "@/components/condition-badge";
import { AddToCartButton } from "@/components/add-to-cart-button";

export function ProductCard({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20 hover:bg-white/[0.06] hover:shadow-[0_24px_60px_rgba(0,0,0,0.5),0_0_40px_rgba(56,189,248,0.08)]",
        className,
      )}
    >
      <Link href={`/product/${product.id}`} className="relative block aspect-[4/3] overflow-hidden bg-[#0a0c12]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0] ?? "/images/hero-laptop.jpg"}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06070b]/70 via-transparent to-transparent" />
        <div className="absolute left-3 top-3 flex gap-2">
          <ConditionBadge condition={product.condition} />
          {discount > 0 && (
            <span className="rounded-full border border-red-400/30 bg-red-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-red-300 backdrop-blur-xl">
              -{discount}%
            </span>
          )}
        </div>
        {product.stock <= 2 && product.stock > 0 && (
          <span className="absolute bottom-3 left-3 rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300 backdrop-blur-xl">
            Only {product.stock} left
          </span>
        )}
        {product.stock <= 0 && (
          <span className="absolute bottom-3 left-3 rounded-full border border-red-400/30 bg-red-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-red-300 backdrop-blur-xl">
            Out of stock
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
            {product.brand}
          </p>
          <Link
            href={`/product/${product.id}`}
            className="mt-1 line-clamp-2 text-base font-semibold leading-snug text-white transition-colors hover:text-cyan-200"
          >
            {product.name}
          </Link>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-400">
          <span className="inline-flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-zinc-500" />
            <span className="line-clamp-1 max-w-[140px]">{product.processor}</span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MemoryStick className="h-3.5 w-3.5 text-zinc-500" /> {product.ram}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <HardDrive className="h-3.5 w-3.5 text-zinc-500" /> {product.storage}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div>
            <p className="text-lg font-bold tracking-tight text-white">
              {formatPKR(product.price)}
            </p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-xs text-zinc-500 line-through">
                {formatPKR(product.originalPrice)}
              </p>
            )}
          </div>
          <AddToCartButton product={product} size="sm" />
        </div>
      </div>
    </div>
  );
}
