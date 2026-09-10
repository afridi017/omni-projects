import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Banknote,
  Briefcase,
  CircuitBoard,
  Cpu,
  Gamepad2,
  Laptop,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  ShieldCheck,
  Sparkles,
  Wrench,
} from "lucide-react";
import { getFeaturedProducts } from "@/lib/queries";
import { SHOP } from "@/lib/constants";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HomeHero } from "@/components/home-hero";
import { ProductCard } from "@/components/product-card";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

const MARQUEE_BRANDS = [
  "Apple", "Dell", "HP", "Lenovo", "ASUS", "MSI", "Acer", "Microsoft Surface",
];

const CATEGORIES = [
  {
    href: "/shop?condition=NEW",
    icon: Sparkles,
    title: "Brand New",
    desc: "Box-packed machines with fresh warranty options.",
    tint: "from-cyan-400/20 to-blue-500/5",
  },
  {
    href: "/shop?condition=LIKE_NEW,EXCELLENT,GOOD",
    icon: PackageCheck,
    title: "Imported Pre-Owned",
    desc: "Grade-A UK/US stock — lab tested, battery verified.",
    tint: "from-indigo-400/20 to-purple-500/5",
  },
  {
    href: "/shop?search=RTX",
    icon: Gamepad2,
    title: "Gaming Rigs",
    desc: "RTX graphics, high-refresh displays, raw power.",
    tint: "from-fuchsia-400/20 to-pink-500/5",
  },
  {
    href: "/shop?search=ThinkPad",
    icon: Briefcase,
    title: "Business Class",
    desc: "ThinkPads, EliteBooks & Latitudes built to last.",
    tint: "from-emerald-400/20 to-teal-500/5",
  },
];

const WHY_US = [
  {
    icon: BadgeCheck,
    title: "Tested & Verified",
    desc: "Every machine passes a 22-point hardware check before it reaches the shelf.",
  },
  {
    icon: Wrench,
    title: "Hardware Service",
    desc: "Screen, battery, keyboard, board-level repairs — done in-house by experts.",
  },
  {
    icon: CircuitBoard,
    title: "Software Installation",
    desc: "Windows, Office, drivers & licensed software installed and activated by DLS.",
  },
  {
    icon: Banknote,
    title: "Cash on Delivery",
    desc: "Inspect your laptop first, pay on delivery. No advance, no risk.",
  },
  {
    icon: ShieldCheck,
    title: "Service Warranty",
    desc: "Every purchase is backed by a DLS service warranty for peace of mind.",
  },
  {
    icon: Cpu,
    title: "Upgrade Lab",
    desc: "SSD, RAM & thermal upgrades to make any machine feel brand new.",
  },
];

export default async function HomePage() {
  const featured = await getFeaturedProducts(8).catch(() => []);

  return (
    <>
      <HomeHero />

      {/* Brand marquee */}
      <section className="relative border-y border-white/5 bg-white/[0.02] py-5">
        <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
          <div className="flex w-max animate-marquee items-center gap-14 pr-14">
            {[...MARQUEE_BRANDS, ...MARQUEE_BRANDS].map((brand, i) => (
              <span
                key={brand + i}
                className="whitespace-nowrap font-display text-sm font-semibold uppercase tracking-[0.35em] text-zinc-600"
              >
                {brand}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Featured laptops */}
      <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                Hand-Picked For You
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
                Featured <span className="text-gradient">Laptops</span>
              </h2>
            </div>
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 text-sm font-medium text-zinc-300 transition-colors hover:text-white"
            >
              View all laptops
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>

        {featured.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featured.slice(0, 8).map((product, i) => (
              <Reveal key={product.id} delay={Math.min(i * 0.06, 0.3)}>
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal className="mt-12">
            <div className="glass-panel flex flex-col items-center gap-4 rounded-3xl px-6 py-16 text-center">
              <Laptop className="h-10 w-10 text-zinc-600" />
              <p className="text-zinc-400">
                Fresh stock is being uploaded. Message us on WhatsApp for the
                latest available machines.
              </p>
              <a href={SHOP.whatsapp} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                <MessageCircle className="h-4 w-4 text-emerald-400" /> WhatsApp {SHOP.phoneDisplay}
              </a>
            </div>
          </Reveal>
        )}
      </section>

      {/* Categories */}
      <section className="relative border-t border-white/5 bg-white/[0.015]">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
              Find Your Fit
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Shop by <span className="text-gradient">Category</span>
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((cat, i) => (
              <Reveal key={cat.title} delay={i * 0.07}>
                <Link
                  href={cat.href}
                  className="group relative flex h-full flex-col gap-4 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition-all duration-500 hover:-translate-y-1.5 hover:border-white/20"
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100", cat.tint)} />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    <cat.icon className="h-5.5 w-5.5 text-cyan-200" />
                  </div>
                  <div className="relative">
                    <h3 className="font-display text-lg font-semibold text-white">{cat.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">{cat.desc}</p>
                  </div>
                  <ArrowUpRight className="relative mt-auto h-4.5 w-4.5 text-zinc-500 transition-all duration-300 group-hover:translate-x-1 group-hover:text-cyan-300" />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us — bento */}
      <section id="services" className="relative mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            {SHOP.tagline}
          </p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Why Peshawar Trusts <span className="text-gradient">DIGITAL LAPTOP</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          <Reveal className="lg:row-span-2">
            <div className="group relative flex h-full min-h-[380px] flex-col justify-end overflow-hidden rounded-3xl border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/service-desk.jpg"
                alt="DLS service lab — laptop hardware and software service"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#05060a] via-[#05060a]/45 to-transparent" />
              <div className="relative p-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-cyan-200 backdrop-blur-xl">
                  <Wrench className="h-3 w-3" /> DLS Service Lab
                </span>
                <h3 className="mt-4 font-display text-2xl font-bold text-white">
                  Software Installation &amp; Hardware Service
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-zinc-300">
                  Windows &amp; licensed software installation, data recovery,
                  SSD/RAM upgrades, screen &amp; battery replacement and
                  board-level repairs — all under one roof.
                </p>
                <a
                  href={SHOP.phoneTel}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-300 transition-colors hover:text-cyan-200"
                >
                  <Phone className="h-4 w-4" /> Book a service: {SHOP.phoneDisplay}
                </a>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-5 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-2">
            {WHY_US.map((item, i) => (
              <Reveal key={item.title} delay={Math.min(i * 0.06, 0.3)}>
                <div className="group h-full rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-500 hover:border-white/20 hover:bg-white/[0.05]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/20 to-cyan-400/10">
                    <item.icon className="h-5 w-5 text-cyan-200" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Visit us / map */}
      <section id="visit" className="relative scroll-mt-24 border-t border-white/5 bg-white/[0.015]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-24 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-stretch lg:px-8">
          <Reveal>
            <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-xl sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                Visit The Shop
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Alharmian Market, <span className="text-gradient">Peshawar</span>
              </h2>
              <div className="mt-8 space-y-5">
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    <MapPin className="h-5 w-5 text-cyan-300" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{SHOP.name}</p>
                    <p className="mt-1 text-sm leading-relaxed text-zinc-400">{SHOP.address}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5">
                    <Phone className="h-5 w-5 text-cyan-300" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{SHOP.phoneOwner}</p>
                    <a href={SHOP.phoneTel} className="mt-1 block text-sm text-zinc-400 transition-colors hover:text-white">
                      {SHOP.phoneDisplay} — tap to call
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-auto flex flex-wrap gap-3 pt-10">
                <a href={SHOP.phoneTel} className={cn(buttonVariants({ variant: "accent" }))}>
                  <Phone className="h-4 w-4" /> Call Now
                </a>
                <a
                  href={SHOP.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ variant: "outline" }), "border-emerald-400/30 text-emerald-300 hover:bg-emerald-400/10")}
                >
                  <MessageCircle className="h-4 w-4" /> WhatsApp
                </a>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="relative h-full min-h-[360px] overflow-hidden rounded-3xl border border-white/10">
              <iframe
                title="DIGITAL LAPTOP location — Alharmian Market, Near Gull Haji Plaza, Peshawar"
                src={SHOP.mapEmbed}
                className="absolute inset-0 h-full w-full border-0 [filter:invert(0.92)_hue-rotate(190deg)_saturate(0.9)_brightness(0.9)]"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden">
        <div className="hero-glow absolute inset-0 opacity-70" />
        <div className="relative mx-auto max-w-7xl px-4 py-24 text-center sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="mx-auto max-w-3xl font-display text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Can&apos;t find your dream machine? <span className="text-gradient">We&apos;ll source it.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-zinc-400">
              Tell us your budget and specs on WhatsApp — we import on order and
              deliver anywhere in Peshawar.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3.5">
              <a
                href={`${SHOP.whatsapp}?text=${encodeURIComponent("Assalam o Alaikum! I want a laptop. My budget is: Rs. ____ | Specs I need: ____")}`}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "accent", size: "lg" }))}
              >
                <MessageCircle className="h-4.5 w-4.5" /> Request a Laptop
              </a>
              <Link href="/shop" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
                Browse Stock <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
