"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Eye } from "lucide-react";
import { Product } from "@/types";
import { formatPKR, getConditionLabel, getConditionColor, calculateDiscount, cn } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const discount = product.originalPrice ? calculateDiscount(product.price, product.originalPrice) : 0;
  const primaryImage = product.images?.[0] || "/placeholder-laptop.jpg";

  async function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    addItem(product);
    setTimeout(() => setAdding(false), 800);
  }

  return (
    <Link
      href={`/products/${product.id}`}
      id={`product-card-${product.id}`}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-slate-900/60 border border-white/8 hover:border-blue-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-800">
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Overlay actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className={cn("px-2.5 py-0.5 rounded-full text-xs font-semibold border", getConditionColor(product.condition))}>
            {getConditionLabel(product.condition)}
          </span>
          {discount > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
              -{discount}%
            </span>
          )}
        </div>

        {/* Quick view */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-medium">
            <Eye className="w-3.5 h-3.5" />
            View Details
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div>
          <p className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">{product.brand}</p>
          <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2 group-hover:text-blue-300 transition-colors duration-200">
            {product.name}
          </h3>
        </div>

        {/* Specs preview */}
        {(product.processor || product.ram || product.storage) && (
          <div className="flex flex-wrap gap-1.5">
            {product.processor && (
              <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-xs">{product.processor.split(" ").slice(0, 3).join(" ")}</span>
            )}
            {product.ram && <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-xs">{product.ram}</span>}
            {product.storage && <span className="px-2 py-0.5 rounded-md bg-white/5 text-slate-400 text-xs">{product.storage}</span>}
          </div>
        )}

        {/* Price & Add to Cart */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <div>
            <p className="text-white font-bold text-lg">{formatPKR(product.price)}</p>
            {product.originalPrice && product.originalPrice > product.price && (
              <p className="text-slate-500 text-xs line-through">{formatPKR(product.originalPrice)}</p>
            )}
          </div>
          <button
            id={`add-to-cart-${product.id}`}
            onClick={handleAddToCart}
            disabled={product.stock === 0 || adding}
            className={cn(
              "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200",
              product.stock === 0
                ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                : adding
                ? "bg-green-500/20 text-green-400 border border-green-500/30"
                : "bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500 hover:text-white"
            )}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {product.stock === 0 ? "Out of Stock" : adding ? "Added!" : "Add"}
          </button>
        </div>
      </div>
    </Link>
  );
}
