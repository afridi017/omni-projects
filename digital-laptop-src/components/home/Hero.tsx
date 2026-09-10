"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag, Star, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(59,130,246,0.15),_transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(139,92,246,0.12),_transparent_60%)]" />

      {/* Animated grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: "64px 64px",
        }}
      />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-float-delayed" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8 animate-slide-up">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium">
            <Zap className="w-4 h-4" />
            <span>Peshawar&apos;s Premium Laptop Store</span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-none tracking-tight">
              <span className="text-white">Premium</span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 bg-clip-text text-transparent">
                Laptops
              </span>
              <br />
              <span className="text-white">at Your</span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Fingertips
              </span>
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed">
              Explore our curated collection of new & refurbished laptops. Software Installation &amp; Hardware Service — all under one roof.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/products"
              id="hero-shop-now"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-400 hover:to-blue-500 transition-all duration-300 hover:-translate-y-0.5 group"
            >
              <ShoppingBag className="w-5 h-5" />
              Shop Now
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <a
              href="https://wa.me/923109516681"
              id="hero-whatsapp"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/5 border border-white/15 text-white font-semibold text-base hover:bg-white/10 hover:border-white/25 transition-all duration-300 hover:-translate-y-0.5"
            >
              WhatsApp Us
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 pt-2">
            {[
              { label: "Products", value: "500+" },
              { label: "Happy Customers", value: "1K+" },
              { label: "Years Experience", value: "5+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-white font-bold text-2xl">{stat.value}</p>
                <p className="text-slate-500 text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Laptop Image */}
        <div className="relative flex items-center justify-center animate-slide-up-delayed">
          <div className="relative w-full max-w-lg">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-2xl scale-110" />

            {/* Rating badge */}
            <div className="absolute -top-4 -right-4 z-10 flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-800/90 border border-white/10 backdrop-blur-sm shadow-xl">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="text-white font-bold text-sm">4.9</span>
              <span className="text-slate-400 text-xs">Rating</span>
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-4 -left-4 z-10 px-3 py-2 rounded-2xl bg-slate-800/90 border border-white/10 backdrop-blur-sm shadow-xl">
              <p className="text-slate-400 text-xs">Trusted by</p>
              <p className="text-white font-bold text-sm">1000+ Customers</p>
            </div>

            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
              <Image
                src="/hero-laptop.png"
                alt="Premium Laptop - DIGITAL LAPTOP Peshawar"
                width={600}
                height={450}
                className="w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <div className="w-0.5 h-8 bg-gradient-to-b from-blue-500/50 to-transparent rounded-full" />
        <p className="text-slate-500 text-xs tracking-widest uppercase">Scroll</p>
      </div>
    </section>
  );
}
