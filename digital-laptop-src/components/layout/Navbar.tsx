"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Monitor, Phone, Menu, X } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Laptops" },
];

export default function Navbar() {
  const { totalItems } = useCart();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 navbar-glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
              <Monitor className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-white font-bold text-sm tracking-wider">DIGITAL</span>
              <span className="text-blue-400 font-bold text-sm tracking-widest">LAPTOP</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors duration-200",
                  pathname === link.href
                    ? "text-blue-400"
                    : "text-slate-400 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Phone link */}
            <a
              href="tel:03109516681"
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 hover:text-green-400 transition-colors duration-200"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>0310-9516681</span>
            </a>

            {/* Cart */}
            <Link
              href="/cart"
              id="cart-button"
              className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:border-blue-500/50"
            >
              <ShoppingCart className="w-4 h-4 text-slate-300" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 rounded-full text-xs text-white font-bold flex items-center justify-center animate-pulse-once">
                  {totalItems > 9 ? "9+" : totalItems}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              id="mobile-menu-toggle"
              className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-4 h-4 text-slate-300" /> : <Menu className="w-4 h-4 text-slate-300" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-slate-900/95 backdrop-blur-xl px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200",
                pathname === link.href
                  ? "text-blue-400 bg-blue-500/10"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              {link.label}
            </Link>
          ))}
          <a
            href="tel:03109516681"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-green-400 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors duration-200"
          >
            <Phone className="w-4 h-4" />
            <span>0310-9516681</span>
          </a>
        </div>
      )}
    </nav>
  );
}
