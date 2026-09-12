"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Cpu,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Truck,
} from "lucide-react";
import type { SiteConfig } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { Button, buttonVariants } from "@/components/ui/button";

const EASE = [0.21, 0.47, 0.32, 0.98] as const;

export function HomeHero({ config }: { config: SiteConfig }) {
  return (
    <section className="relative overflow-hidden">
      <div className="hero-glow absolute inset-0" />
      <div className="bg-grid absolute inset-0" />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-4 pb-20 pt-36 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:pb-28 lg:pt-44">
        {/* Copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wide text-zinc-300 backdrop-blur-xl"
          >
            <MapPin className="h-3.5 w-3.5 text-cyan-300" />
            {config.heroBadge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.08, ease: EASE }}
            className="mt-6 font-display text-5xl font-bold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-7xl"
          >
            {config.heroTitle}
            <br />
            <span className="text-gradient">{config.heroTitleAccent}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.16, ease: EASE }}
            className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400 sm:text-lg"
          >
            {config.siteName} — {config.tagline}. {config.heroSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.24, ease: EASE }}
            className="mt-9 flex flex-wrap items-center gap-3.5"
          >
            <Link
              href="/shop"
              className={cn(
                buttonVariants({ variant: "accent", size: "lg" }),
                "group",
              )}
            >
              Shop Laptops
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href={config.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="outline"
                size="lg"
                className="border-emerald-400/30 text-emerald-300 hover:border-emerald-400/60 hover:bg-emerald-400/10"
              >
                <MessageCircle className="h-4.5 w-4.5" />
                WhatsApp Us
              </Button>
            </Link>
            <a
              href={config.phoneTel}
              className="group flex items-center gap-2.5 rounded-full px-3 py-2 text-sm text-zinc-300 transition-colors hover:text-white"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-colors group-hover:border-cyan-400/40">
                <Phone className="h-4 w-4 text-cyan-300" />
              </span>
              <span className="leading-tight">
                <span className="block text-[11px] uppercase tracking-wider text-zinc-500">
                  Call {config.phoneOwner}
                </span>
                <span className="font-semibold tracking-wide">
                  {config.phoneDisplay}
                </span>
              </span>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.45 }}
            className="mt-12 grid max-w-lg grid-cols-3 divide-x divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl"
          >
            {[
              { icon: BadgeCheck, big: "500+", small: "Machines Delivered" },
              { icon: ShieldCheck, big: "Checked", small: "& Lab Tested" },
              { icon: Truck, big: "COD", small: "Cash on Delivery" },
            ].map((s) => (
              <div
                key={s.big}
                className="flex flex-col items-center gap-1 px-3 py-4 text-center"
              >
                <s.icon className="mb-1 h-4 w-4 text-cyan-300/80" />
                <span className="font-display text-lg font-bold text-white">
                  {s.big}
                </span>
                <span className="text-[11px] text-zinc-500">{s.small}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: EASE }}
          className="relative mx-auto w-full max-w-[560px]"
        >
          <div className="ring-conic absolute inset-6 rounded-full" />
          <motion.div
            animate={{ y: [0, -16, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-[0_40px_120px_rgba(0,0,0,0.6)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.heroImageUrl}
              alt={`Premium laptop at ${config.siteName} Peshawar`}
              className="aspect-[4/3.4] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#06070b]/60 via-transparent to-transparent" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.6,
            }}
            className="glass-panel absolute -left-4 top-10 hidden rounded-2xl px-4 py-3 sm:block"
          >
            <div className="flex items-center gap-2.5">
              <Cpu className="h-5 w-5 text-indigo-300" />
              <div className="text-xs leading-tight">
                <p className="font-semibold text-white">
                  {config.heroBadgeTitle}
                </p>
                <p className="text-zinc-500">{config.heroBadgeSubtitle}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 6.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1.2,
            }}
            className="glass-panel absolute -right-3 bottom-12 hidden rounded-2xl px-4 py-3 sm:block"
          >
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
              <div className="text-xs leading-tight">
                <p className="font-semibold text-white">
                  {config.serviceBadgeTitle}
                </p>
                <p className="text-zinc-500">{config.serviceBadgeSubtitle}</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
