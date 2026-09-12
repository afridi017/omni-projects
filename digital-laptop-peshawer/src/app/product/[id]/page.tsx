import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  ArrowLeft,
  BatteryCharging,
  Banknote,
  Cpu,
  Gpu,
  HardDrive,
  MemoryStick,
  MessageCircle,
  Monitor,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { getProductById, getRelatedProducts } from "@/lib/queries";
import { getSiteConfig } from "@/lib/settings";
import { cn, formatPKR } from "@/lib/utils";
import { ProductGallery } from "@/components/product-gallery";
import { ProductCard } from "@/components/product-card";
import { ProductPurchase } from "@/components/product-purchase";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(Number(id)).catch(() => undefined);
  if (!product) return { title: "Laptop not found" };
  return {
    title: `${product.name} — ${formatPKR(product.price)}`,
    description: `${product.name} (${product.condition}) — ${product.processor}, ${product.ram}, ${product.storage}, ${product.gpu}. Available at DIGITAL LAPTOP Peshawar with ${product.warranty}. Cash on Delivery. Call 0310-9516681.`,
  };
}

function SpecRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.02] px-5 py-4">
      <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <Icon className="h-4 w-4 text-cyan-300" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium leading-relaxed text-zinc-100">
          {value}
        </p>
      </div>
    </div>
  );
}

export default async function ProductPage({ params }: { params: Params }) {
  const { id } = await params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) notFound();

  const [product, config] = await Promise.all([
    getProductById(productId).catch(() => undefined),
    getSiteConfig(),
  ]);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 4).catch(() => []);
  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) / product.originalPrice) *
            100,
        )
      : 0;

  const waMessage = `${config.whatsapp}?text=${encodeURIComponent(
    `Assalam o Alaikum DIGITAL LAPTOP! I'm interested in:\n\n${product.name}\nPrice: ${formatPKR(product.price)}\nLink: ${process.env.NEXT_PUBLIC_SITE_URL ?? "https://digital-laptop-peshawer.vercel.app"}/product/${product.id}\n\nIs this available?`,
  )}`;

  return (
    <div className="relative">
      <div className="hero-glow absolute inset-x-0 top-0 h-[520px]" />
      <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
        <Link
          href="/shop"
          className="mb-8 inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Back to shop
        </Link>

        <div className="grid gap-12 lg:grid-cols-2">
          <Reveal>
            <div className="lg:sticky lg:top-28">
              <ProductGallery
                images={product.images}
                name={product.name}
                condition={product.condition}
              />
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
                {product.brand} · {product.model}
              </p>
              <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                {product.name}
              </h1>

              <div className="mt-5 flex flex-wrap items-center gap-3">
                <span className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  {formatPKR(product.price)}
                </span>
                {product.originalPrice &&
                  product.originalPrice > product.price && (
                    <>
                      <span className="text-lg text-zinc-500 line-through">
                        {formatPKR(product.originalPrice)}
                      </span>
                      <Badge variant="danger">Save {discount}%</Badge>
                    </>
                  )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Badge variant={product.stock > 0 ? "success" : "danger"}>
                  {product.stock > 0
                    ? `In Stock (${product.stock})`
                    : "Out of Stock"}
                </Badge>
                <Badge>
                  <ShieldCheck className="h-3 w-3" /> {product.warranty}
                </Badge>
                <Badge>
                  <Banknote className="h-3 w-3" /> Cash on Delivery
                </Badge>
              </div>

              <p className="mt-7 whitespace-pre-line text-sm leading-relaxed text-zinc-400 sm:text-base">
                {product.description}
              </p>

              <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl">
                <ProductPurchase product={product} />
                <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/5 pt-4 text-xs text-zinc-500">
                  <span className="inline-flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-cyan-300/70" /> Same-day
                    delivery in Peshawar
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-cyan-300/70" /> DLS
                    lab tested
                  </span>
                </div>
              </div>

              <a
                href={waMessage}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "mt-4 w-full border-emerald-400/25 text-emerald-300 hover:border-emerald-400/50 hover:bg-emerald-400/10",
                )}
              >
                <MessageCircle className="h-4.5 w-4.5" /> Ask about this laptop
                on WhatsApp
              </a>
            </div>
          </Reveal>
        </div>

        {/* Specs */}
        <Reveal className="mt-20">
          <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Full <span className="text-gradient">Specifications</span>
          </h2>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <SpecRow icon={Cpu} label="Processor" value={product.processor} />
            <SpecRow
              icon={MemoryStick}
              label="Memory (RAM)"
              value={product.ram}
            />
            <SpecRow icon={HardDrive} label="Storage" value={product.storage} />
            <SpecRow icon={Gpu} label="Graphics" value={product.gpu} />
            <SpecRow icon={Monitor} label="Display" value={product.display} />
            <SpecRow
              icon={BatteryCharging}
              label="Battery"
              value={product.battery}
            />
            <SpecRow
              icon={ShieldCheck}
              label="Warranty"
              value={product.warranty}
            />
            <SpecRow
              icon={Truck}
              label="Delivery"
              value="Cash on Delivery — Peshawar"
            />
          </div>
        </Reveal>

        {/* Related */}
        {related.length > 0 && (
          <Reveal className="mt-24">
            <div className="flex items-end justify-between gap-6">
              <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
                You may also <span className="text-gradient">like</span>
              </h2>
              <Link
                href="/shop"
                className="text-sm text-zinc-400 transition-colors hover:text-white"
              >
                View all →
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </Reveal>
        )}
      </div>
    </div>
  );
}
