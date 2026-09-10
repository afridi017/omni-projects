"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, ShieldCheck, Phone, ArrowLeft, Zap } from "lucide-react";
import { formatPKR, getConditionLabel, getConditionColor, calculateDiscount, cn } from "@/lib/utils";
import { useCart } from "@/components/cart/CartProvider";
import { Product } from "@/types";

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem, items } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const discount = product.originalPrice ? calculateDiscount(product.price, product.originalPrice) : 0;
  const cartItem = items.find((i) => i.product.id === product.id);

  async function handleAddToCart() {
    setAdding(true);
    addItem(product, quantity);
    setTimeout(() => setAdding(false), 800);
  }

  function handleBuyNow() {
    addItem(product, quantity);
    router.push("/checkout");
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        id="back-to-products"
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors duration-200"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Brand & Condition */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-semibold">
          {product.brand}
        </span>
        <span className={cn("px-3 py-1 rounded-full text-xs font-semibold border", getConditionColor(product.condition))}>
          {getConditionLabel(product.condition)}
        </span>
        {discount > 0 && (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-400 border border-red-500/30">
            {discount}% OFF
          </span>
        )}
      </div>

      {/* Name */}
      <div>
        <h1 className="text-white text-2xl sm:text-3xl font-bold leading-tight">{product.name}</h1>
        <p className="text-slate-400 text-sm mt-1">Model: {product.model}</p>
      </div>

      {/* Price */}
      <div className="flex items-end gap-3">
        <p className="text-white text-4xl font-extrabold">{formatPKR(product.price)}</p>
        {product.originalPrice && product.originalPrice > product.price && (
          <p className="text-slate-500 text-xl line-through mb-1">{formatPKR(product.originalPrice)}</p>
        )}
      </div>

      {/* Stock */}
      <div className="flex items-center gap-2">
        {product.stock > 0 ? (
          <>
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium">
              {product.stock <= 3 ? `Only ${product.stock} left!` : "In Stock"}
            </span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span className="text-red-400 text-sm font-medium">Out of Stock</span>
          </>
        )}
      </div>

      {/* Quantity */}
      {product.stock > 0 && (
        <div className="flex items-center gap-4">
          <span className="text-slate-400 text-sm">Quantity:</span>
          <div className="flex items-center rounded-xl border border-white/10 overflow-hidden">
            <button
              id="qty-minus"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150 text-lg"
            >
              −
            </button>
            <span className="w-12 text-center text-white font-semibold">{quantity}</span>
            <button
              id="qty-plus"
              onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150 text-lg"
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* CTA Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          id="add-to-cart-detail"
          onClick={handleAddToCart}
          disabled={product.stock === 0 || adding}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-base transition-all duration-200",
            product.stock === 0
              ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
              : adding
              ? "bg-green-500/20 text-green-400 border border-green-500/30"
              : "bg-white/5 border border-white/15 text-white hover:bg-white/10 hover:border-white/25"
          )}
        >
          <ShoppingCart className="w-5 h-5" />
          {adding ? "Added to Cart!" : cartItem ? `In Cart (${cartItem.quantity})` : "Add to Cart"}
        </button>
        <button
          id="buy-now-detail"
          onClick={handleBuyNow}
          disabled={product.stock === 0}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-base transition-all duration-200",
            product.stock === 0
              ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-400 hover:to-blue-500 hover:-translate-y-0.5"
          )}
        >
          <Zap className="w-5 h-5" />
          Buy Now — COD
        </button>
      </div>

      {/* Info Pills */}
      <div className="flex flex-wrap gap-2 pt-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          {product.warranty || "Warranty Included"}
        </div>
        <a
          href="https://wa.me/923109516681"
          id="detail-whatsapp"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-xs hover:bg-green-500/20 transition-colors duration-200"
        >
          <Phone className="w-3.5 h-3.5" />
          Ask on WhatsApp
        </a>
      </div>

      {/* Description */}
      {product.description && (
        <div className="pt-4 border-t border-white/8">
          <h3 className="text-white font-semibold mb-2">Description</h3>
          <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{product.description}</p>
        </div>
      )}
    </div>
  );
}
