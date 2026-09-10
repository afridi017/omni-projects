"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const validImages = images?.length > 0 ? images : ["/placeholder-laptop.jpg"];

  function prev() {
    setActiveIndex((i) => (i === 0 ? validImages.length - 1 : i - 1));
  }
  function next() {
    setActiveIndex((i) => (i === validImages.length - 1 ? 0 : i + 1));
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div
        id="product-main-image"
        className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-slate-800/80 border border-white/8 group cursor-zoom-in"
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <Image
          src={validImages[activeIndex]}
          alt={`${productName} - image ${activeIndex + 1}`}
          fill
          className={cn(
            "object-cover transition-transform duration-500",
            isZoomed ? "scale-125" : "group-hover:scale-102"
          )}
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
        />

        {/* Zoom hint */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white text-xs">
            <ZoomIn className="w-3.5 h-3.5" />
            {isZoomed ? "Click to unzoom" : "Click to zoom"}
          </div>
        </div>

        {/* Nav arrows */}
        {validImages.length > 1 && (
          <>
            <button
              id="gallery-prev"
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:bg-black/70"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="gallery-next"
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm border border-white/20 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center hover:bg-black/70"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Image counter */}
        {validImages.length > 1 && (
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-medium">
            {activeIndex + 1}/{validImages.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {validImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {validImages.map((img, i) => (
            <button
              key={i}
              id={`gallery-thumb-${i}`}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200",
                i === activeIndex
                  ? "border-blue-500 shadow-lg shadow-blue-500/20"
                  : "border-white/10 hover:border-white/30 opacity-70 hover:opacity-100"
              )}
            >
              <Image
                src={img}
                alt={`${productName} thumbnail ${i + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
