"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, PackageOpen, Pencil, Star, Trash2 } from "lucide-react";
import type { Product } from "@/db/schema";
import { cn, formatPKR } from "@/lib/utils";
import { ConditionBadge } from "@/components/condition-badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function ProductsTable({
  products,
  onEdit,
  onToggleFeatured,
  onDelete,
}: {
  products: Product[];
  onEdit: (product: Product) => void;
  onToggleFeatured: (product: Product) => Promise<void>;
  onDelete: (product: Product) => Promise<void>;
}) {
  const [busyId, setBusyId] = useState<number | null>(null);

  async function run(product: Product, action: (p: Product) => Promise<void>) {
    setBusyId(product.id);
    try {
      await action(product);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-white/10 px-6 py-5">
        <h2 className="font-display text-lg font-semibold text-white">
          Inventory <span className="text-sm font-normal text-zinc-500">({products.length} products)</span>
        </h2>
      </div>
      {products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
          <PackageOpen className="h-10 w-10 text-zinc-600" />
          <p className="text-sm text-zinc-500">No products yet — add your first laptop from the &quot;Add Laptop&quot; tab.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Condition</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-center">Featured</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id} className={cn(busyId === p.id && "pointer-events-none opacity-50")}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-14 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-[#0a0c12]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.images[0] ?? "/images/hero-laptop.jpg"} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="min-w-0">
                      <p className="line-clamp-1 max-w-[260px] font-medium text-white">{p.name}</p>
                      <p className="text-xs text-zinc-500">{p.brand} · {p.model}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell><ConditionBadge condition={p.condition} /></TableCell>
                <TableCell>
                  <span className="font-semibold text-white">{formatPKR(p.price)}</span>
                  {p.originalPrice ? (
                    <span className="ml-1.5 text-xs text-zinc-500 line-through">{formatPKR(p.originalPrice)}</span>
                  ) : null}
                </TableCell>
                <TableCell>
                  <span className={cn(
                    "rounded-full px-2.5 py-1 text-xs font-bold",
                    p.stock === 0
                      ? "bg-red-500/15 text-red-300"
                      : p.stock <= 3
                        ? "bg-amber-500/15 text-amber-300"
                        : "bg-emerald-500/15 text-emerald-300",
                  )}>
                    {p.stock}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <button
                    onClick={() => run(p, onToggleFeatured)}
                    title={p.featured ? "Remove from featured" : "Mark as featured"}
                    className={cn(
                      "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all",
                      p.featured
                        ? "border-amber-400/40 bg-amber-400/15 text-amber-300"
                        : "border-white/10 bg-white/5 text-zinc-500 hover:text-amber-200",
                    )}
                  >
                    <Star className={cn("h-4 w-4", p.featured && "fill-amber-300")} />
                  </button>
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-1.5">
                    <Link
                      href={`/product/${p.id}`}
                      target="_blank"
                      title="View on store"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:text-white"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => onEdit(p)}
                      title="Edit"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:border-cyan-400/40 hover:text-cyan-300"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${p.name}"? This cannot be undone.`)) {
                          run(p, onDelete);
                        }
                      }}
                      title="Delete"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 transition-colors hover:border-red-400/40 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
}
