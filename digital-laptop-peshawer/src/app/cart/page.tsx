"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn, formatPKR } from "@/lib/utils";

export default function CartPage() {
  const { items, hydrated, subtotal, setQuantity, removeItem, clear } = useCart();

  return (
    <div className="relative">
      <div className="hero-glow absolute inset-x-0 top-0 h-[360px]" />
      <div className="relative mx-auto max-w-5xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Your Bag</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Shopping <span className="text-gradient">Cart</span>
        </h1>

        {!hydrated ? (
          <div className="mt-12 space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 animate-pulse rounded-3xl bg-white/[0.05]" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="glass-panel mt-12 flex flex-col items-center gap-5 rounded-3xl px-6 py-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-white/5">
              <ShoppingBag className="h-7 w-7 text-zinc-500" />
            </span>
            <h2 className="font-display text-xl font-semibold text-white">Your cart is empty</h2>
            <p className="max-w-sm text-sm text-zinc-400">
              Browse our premium laptops and add your favourite machine — Cash on
              Delivery available across Peshawar.
            </p>
            <Link href="/shop" className={cn(buttonVariants({ variant: "accent" }))}>
              Browse Laptops <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl sm:gap-6 sm:p-5"
                >
                  <Link
                    href={`/product/${item.productId}`}
                    className="relative h-24 w-28 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0c12] sm:h-28 sm:w-36"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image ?? "/images/hero-laptop.jpg"}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">
                          {item.brand}
                        </p>
                        <Link
                          href={`/product/${item.productId}`}
                          className="mt-0.5 line-clamp-2 text-sm font-semibold text-white hover:text-cyan-200 sm:text-base"
                        >
                          {item.name}
                        </Link>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
                        aria-label="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3 pt-3">
                      <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-0.5">
                        <button
                          onClick={() => setQuantity(item.productId, item.quantity - 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-7 text-center text-sm font-semibold text-white">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(item.productId, item.quantity + 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 hover:bg-white/10 hover:text-white disabled:opacity-40"
                          disabled={item.quantity >= item.stock}
                          aria-label="Increase"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-sm font-bold text-white sm:text-base">
                        {formatPKR(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between pt-2">
                <Link href="/shop" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
                  <ArrowLeft className="h-4 w-4" /> Continue shopping
                </Link>
                <Button variant="ghost" size="sm" onClick={clear} className="text-zinc-500 hover:text-red-300">
                  <Trash2 className="h-3.5 w-3.5" /> Clear cart
                </Button>
              </div>
            </div>

            <div className="h-fit rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl lg:sticky lg:top-28">
              <h2 className="font-display text-lg font-semibold text-white">Order Summary</h2>
              <div className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span className="text-white">{formatPKR(subtotal)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Delivery</span>
                  <span className="text-emerald-300">Free — COD</span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-white">Total</span>
                    <span className="font-display text-xl font-bold text-white">{formatPKR(subtotal)}</span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">Pay in cash when your laptop arrives.</p>
                </div>
              </div>
              <Link
                href="/checkout"
                className={cn(buttonVariants({ variant: "accent", size: "lg" }), "mt-6 w-full")}
              >
                Proceed to Checkout <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
