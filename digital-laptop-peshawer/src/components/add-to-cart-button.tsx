"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart-provider";
import type { Product } from "@/db/schema";
import { cn } from "@/lib/utils";

export function AddToCartButton({
  product,
  className,
  size = "default",
  quantity = 1,
}: {
  product: Product;
  className?: string;
  size?: "default" | "sm" | "lg";
  quantity?: number;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const outOfStock = product.stock <= 0;

  return (
    <Button
      variant={added ? "outline" : "accent"}
      size={size}
      disabled={outOfStock}
      className={cn(className)}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (outOfStock) return;
        addItem(
          {
            productId: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image: product.images[0] ?? null,
            stock: product.stock,
          },
          quantity,
        );
        setAdded(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setAdded(false), 1600);
      }}
    >
      {outOfStock ? (
        "Out of Stock"
      ) : added ? (
        <>
          <Check className="h-4 w-4 text-emerald-400" /> Added
        </>
      ) : (
        <>
          <ShoppingBag className="h-4 w-4" /> Add to Cart
        </>
      )}
    </Button>
  );
}
