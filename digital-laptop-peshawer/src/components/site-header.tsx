"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, ShoppingBag, X, Zap } from "lucide-react";
import type { SiteConfig } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { useCart } from "@/components/cart-provider";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/#services", label: "Services" },
  { href: "/#visit", label: "Visit Us" },
  { href: "/track", label: "Track Order" },
];

export function SiteHeader({ config }: { config: SiteConfig }) {
  const pathname = usePathname();
  const { count } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-white/10 bg-[#06070b]/80 backdrop-blur-2xl"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 shadow-[0_0_24px_rgba(56,189,248,0.4)] transition-transform duration-300 group-hover:rotate-6">
            <Zap className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
          </span>
          <span className="text-lg font-bold tracking-[0.18em] text-white">
            {config.siteName.split(" ")[0]}
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
              {" "}
              {config.siteName.split(" ")[1] ?? "LAPTOP"}
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm text-zinc-400 transition-colors hover:bg-white/5 hover:text-white",
                pathname === item.href && "text-white",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href={config.phoneTel}
            className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-zinc-200 backdrop-blur-xl transition-all hover:border-cyan-400/40 hover:text-white lg:flex"
          >
            <Phone className="h-3.5 w-3.5 text-cyan-300" />
            <span className="tracking-wide">{config.phoneDisplay}</span>
          </a>
          <Link
            href="/cart"
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-200 backdrop-blur-xl transition-colors hover:border-white/25 hover:text-white"
            aria-label="Cart"
          >
            <ShoppingBag className="h-4.5 w-4.5" />
            {count > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 px-1 text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-200 md:hidden"
            aria-label="Menu"
          >
            {open ? (
              <X className="h-4.5 w-4.5" />
            ) : (
              <Menu className="h-4.5 w-4.5" />
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#06070b]/95 px-4 py-4 backdrop-blur-2xl md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-xl px-4 py-3 text-sm text-zinc-300 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <a
              href={config.phoneTel}
              className="mt-2 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200"
            >
              <Phone className="h-4 w-4 text-cyan-300" /> Call{" "}
              {config.phoneDisplay}
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
