import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle2, MapPin, Phone, ShoppingBag, User } from "lucide-react";
import { getOrderWithDetails } from "@/lib/queries";
import { buildWhatsAppOrderUrl } from "@/lib/constants";
import { formatPKR, orderNumber } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { WhatsAppRedirect } from "@/components/whatsapp-redirect";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Confirmed",
  robots: { index: false },
};

type Params = Promise<{ id: string }>;

export default async function OrderSuccessPage({ params }: { params: Params }) {
  const { id } = await params;
  const orderId = Number(id);

  const details = Number.isFinite(orderId)
    ? await getOrderWithDetails(orderId).catch(() => undefined)
    : undefined;

  if (!details) {
    return (
      <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-4 pt-24 text-center">
        <ShoppingBag className="h-12 w-12 text-zinc-600" />
        <h1 className="mt-6 font-display text-3xl font-bold text-white">Order not found</h1>
        <p className="mt-3 text-zinc-400">
          We couldn&apos;t find this order. If you just placed it, please wait a
          moment and refresh — or contact us on WhatsApp.
        </p>
        <Link href="/shop" className={cn(buttonVariants({ variant: "accent" }), "mt-8")}>
          Back to Shop
        </Link>
      </div>
    );
  }

  const { order, customer, items } = details;
  const number = orderNumber(order.id);

  const lines = [
    "New Order — DIGITAL LAPTOP",
    `Order ID: ${number}`,
    "------------------------------",
    ...items.map(
      (i) => `${i.quantity}× ${i.name} — ${formatPKR(i.price * i.quantity)}`,
    ),
    "------------------------------",
    `Total: ${formatPKR(order.total)} (Cash on Delivery)`,
    "",
    `Name: ${customer.fullName}`,
    `Phone: ${customer.phone}`,
    `City: ${customer.city}`,
    `Address: ${customer.address}`,
  ];
  const waUrl = buildWhatsAppOrderUrl(lines.join("\n"));

  return (
    <div className="relative">
      <div className="hero-glow absolute inset-x-0 top-0 h-[420px]" />
      <div className="relative mx-auto max-w-3xl px-4 pb-24 pt-32 sm:px-6">
        <div className="flex flex-col items-center text-center">
          <span className="relative flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20" />
            <span className="flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10">
              <CheckCircle2 className="h-10 w-10 text-emerald-300" />
            </span>
          </span>
          <h1 className="mt-7 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Order <span className="text-gradient">Confirmed!</span>
          </h1>
          <p className="mt-4 max-w-md text-zinc-400">
            Thank you, <span className="text-white">{customer.fullName}</span>. Your
            order has been received. Confirm it on WhatsApp and we&apos;ll prepare
            your delivery.
          </p>
          <div className="mt-6 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-6 py-2 font-display text-lg font-bold tracking-widest text-cyan-200">
            Order ID: {number}
          </div>
        </div>

        <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
          <h2 className="font-display text-lg font-semibold text-white">Order Summary</h2>
          <div className="mt-5 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-4 text-sm">
                <span className="text-zinc-300">
                  <span className="font-semibold text-white">{item.quantity}×</span> {item.name}
                </span>
                <span className="shrink-0 font-medium text-white">
                  {formatPKR(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
            <span className="font-semibold text-white">Total (COD)</span>
            <span className="font-display text-2xl font-bold text-white">{formatPKR(order.total)}</span>
          </div>

          <div className="mt-7 grid gap-3 rounded-2xl border border-white/5 bg-white/[0.02] p-5 text-sm sm:grid-cols-2">
            <p className="flex items-center gap-2.5 text-zinc-400">
              <User className="h-4 w-4 text-cyan-300/70" /> {customer.fullName}
            </p>
            <p className="flex items-center gap-2.5 text-zinc-400">
              <Phone className="h-4 w-4 text-cyan-300/70" /> {customer.phone}
            </p>
            <p className="flex items-start gap-2.5 text-zinc-400 sm:col-span-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300/70" />
              {customer.address}, {customer.city}
            </p>
          </div>
        </div>

        <WhatsAppRedirect waUrl={waUrl} />
      </div>
    </div>
  );
}
