import Link from "next/link";
import { Clock, Code2, Mail, MapPin, MessageCircle, Phone, Zap } from "lucide-react";
import { DEVELOPER, SHOP } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-white/10 bg-[#05060a]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400">
                <Zap className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
              </span>
              <span className="text-lg font-bold tracking-[0.18em] text-white">
                DIGITAL<span className="text-cyan-300"> LAPTOP</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-zinc-400">{SHOP.tagline}</p>
            <p className="text-sm leading-relaxed text-zinc-500">
              Peshawar&apos;s trusted destination for premium new &amp; imported
              laptops — checked, tested and serviced by experts.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Explore
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/shop", label: "All Laptops" },
                { href: "/shop?condition=NEW", label: "Brand New" },
                { href: "/shop?sort=price-asc", label: "Budget Picks" },
                { href: "/shop?brand=Apple", label: "MacBooks" },
                { href: "/#services", label: "DLS Services" },
                { href: "/#visit", label: "Find the Shop" },
              ].map((l) => (
                <li key={l.href + l.label}>
                  <Link href={l.href} className="text-zinc-400 transition-colors hover:text-cyan-300">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Contact
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li className="flex items-start gap-3 text-zinc-400">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                <span>{SHOP.address}</span>
              </li>
              <li>
                <a
                  href={SHOP.phoneTel}
                  className="flex items-center gap-3 text-zinc-400 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0 text-cyan-300" />
                  <span>{SHOP.phoneOwner}: {SHOP.phoneDisplay}</span>
                </a>
              </li>
              <li>
                <a
                  href={SHOP.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-zinc-400 transition-colors hover:text-emerald-300"
                >
                  <MessageCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                  <span>WhatsApp {SHOP.phoneDisplay}</span>
                </a>
              </li>
              <li className="flex items-center gap-3 text-zinc-400">
                <Clock className="h-4 w-4 shrink-0 text-cyan-300" />
                <span>Mon – Sat · 10:00 AM – 9:00 PM</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Why DLS
            </h4>
            <ul className="space-y-2.5 text-sm text-zinc-400">
              <li>✦ Tested &amp; verified machines</li>
              <li>✦ Software installation service</li>
              <li>✦ Hardware repair experts</li>
              <li>✦ Cash on Delivery available</li>
              <li>✦ Best rates in Peshawar</li>
            </ul>
          </div>
        </div>

        <Separator className="my-10" />

        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="text-xs text-zinc-500">
            © {new Date().getFullYear()} {SHOP.name} — {SHOP.tagline}. All rights reserved.
          </p>
          <p className="text-xs text-zinc-600">
            Shop No 12A, Alharmian Market, Peshawar, Pakistan
          </p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-1.5 border-t border-white/5 pt-6 text-[11px] text-zinc-600 sm:flex-row sm:justify-center sm:gap-2">
          <span>Developed by {DEVELOPER.name}</span>
          <span className="hidden sm:inline text-zinc-700">|</span>
          <a
            href={`mailto:${DEVELOPER.email}`}
            className="inline-flex items-center gap-1 transition-colors hover:text-zinc-400"
          >
            <Mail className="h-3 w-3" /> {DEVELOPER.email}
          </a>
          <span className="hidden sm:inline text-zinc-700">|</span>
          <a
            href={DEVELOPER.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition-colors hover:text-zinc-400"
          >
            <Code2 className="h-3 w-3" /> {DEVELOPER.githubDisplay}
          </a>
        </div>
      </div>
    </footer>
  );
}
