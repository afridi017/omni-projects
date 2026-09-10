"use client";

import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/components/cart/CartProvider";
import { formatPKR } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-20 flex items-center justify-center">
          <div className="text-center py-16 px-4">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-slate-800/60 flex items-center justify-center text-5xl">
              🛒
            </div>
            <h1 className="text-white text-2xl font-bold mb-3">Your Cart is Empty</h1>
            <p className="text-slate-400 mb-8">Looks like you haven&apos;t added anything yet.</p>
            <Link
              href="/products"
              id="cart-browse-laptops"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold hover:from-blue-400 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-blue-500/25"
            >
              <ShoppingBag className="w-5 h-5" />
              Browse Laptops
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white mb-8">Shopping Cart</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => {
                const image = item.product.images?.[0] || "/placeholder-laptop.jpg";
                return (
                  <div
                    key={item.product.id}
                    id={`cart-item-${item.product.id}`}
                    className="flex gap-4 p-4 rounded-2xl bg-slate-900/60 border border-white/8 hover:border-white/15 transition-all duration-200"
                  >
                    {/* Image */}
                    <div className="relative w-24 h-20 rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                      <Image
                        src={image}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-blue-400 text-xs font-semibold">{item.product.brand}</p>
                          <Link
                            href={`/products/${item.product.id}`}
                            className="text-white font-semibold text-sm hover:text-blue-300 transition-colors duration-200 line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                        </div>
                        <button
                          id={`remove-${item.product.id}`}
                          onClick={() => removeItem(item.product.id)}
                          className="text-slate-500 hover:text-red-400 transition-colors duration-200 p-1 rounded-lg hover:bg-red-500/10 flex-shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity */}
                        <div className="flex items-center gap-1 rounded-xl border border-white/10 overflow-hidden">
                          <button
                            id={`qty-minus-${item.product.id}`}
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-white font-medium text-sm">{item.quantity}</span>
                          <button
                            id={`qty-plus-${item.product.id}`}
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <p className="text-white font-bold">{formatPKR(item.product.price * item.quantity)}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-2xl bg-slate-900/60 border border-white/8 space-y-4">
                <h2 className="text-white font-bold text-lg">Order Summary</h2>

                <div className="space-y-2">
                  <div className="flex justify-between text-slate-400 text-sm">
                    <span>Items ({totalItems})</span>
                    <span>{formatPKR(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-sm">
                    <span>Delivery</span>
                    <span className="text-emerald-400">Free</span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-sm">
                    <span>Payment</span>
                    <span className="text-amber-400">Cash on Delivery</span>
                  </div>
                </div>

                <div className="border-t border-white/8 pt-4">
                  <div className="flex justify-between text-white font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPKR(totalPrice)}</span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  id="proceed-to-checkout"
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-400 hover:to-blue-500 transition-all duration-200 hover:-translate-y-0.5"
                >
                  Proceed to Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/products"
                  className="w-full flex items-center justify-center py-2 text-slate-400 hover:text-white text-sm transition-colors duration-200"
                >
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
