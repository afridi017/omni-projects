"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, Minus, Plus, ShoppingBag, Zap } from "lucide-react";
import type { Product } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";

export function ProductPurchase({ product }: { product: Product }) {
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const outOfStock = product.stock <= 0;

  const toCartItem = () => ({
    productId: product.id,
    name: product.name,
    brand: product.brand,
    price: product.price,
    image: product.images[0] ?? null,
    stock: product.stock,
  });

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Quantity</span>
        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
            disabled={outOfStock}
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-semibold text-white">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(Math.max(product.stock, 1), q + 1))}
            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-40"
            disabled={outOfStock}
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant={added ? "outline" : "accent"}
          size="lg"
          className="flex-1"
          disabled={outOfStock}
          onClick={() => {
            addItem(toCartItem(), quantity);
            setAdded(true);
            setTimeout(() => setAdded(false), 1600);
          }}
        >
          {outOfStock ? (
            "Out of Stock"
          ) : added ? (
            <><Check className="h-4.5 w-4.5 text-emerald-400" /> Added to Cart</>
          ) : (
            <><ShoppingBag className="h-4.5 w-4.5" /> Add to Cart</>
          )}
        </Button>
        <Button
          size="lg"
          className="flex-1"
          disabled={outOfStock}
          onClick={() => {
            addItem(toCartItem(), quantity);
            router.push("/checkout");
          }}
        >
          <Zap className="h-4.5 w-4.5" /> Buy Now — COD
        </Button>
      </div>
    </div>
  );
}
