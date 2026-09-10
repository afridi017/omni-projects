"use client";

import { useState } from "react";
import type { Condition } from "@/db/schema";
import { cn } from "@/lib/utils";
import { ConditionBadge } from "@/components/condition-badge";

export function ProductGallery({
  images,
  name,
  condition,
}: {
  images: string[];
  name: string;
  condition: Condition;
}) {
  const gallery = images.length ? images : ["/images/hero-laptop.jpg"];
  const [active, setActive] = useState(0);

  return (
    <div className="space-y-4">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-[#0a0c12]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={gallery[active]}
          src={gallery[active]}
          alt={name}
          className="h-full w-full object-cover"
        />
        <div className="absolute left-4 top-4">
          <ConditionBadge condition={condition} />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06070b]/40 via-transparent to-transparent" />
      </div>
      {gallery.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {gallery.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-20 w-24 shrink-0 overflow-hidden rounded-xl border transition-all duration-300",
                i === active
                  ? "border-cyan-400/60 shadow-[0_0_18px_rgba(34,211,238,0.25)]"
                  : "border-white/10 opacity-60 hover:opacity-100",
              )}
              aria-label={`View image ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
