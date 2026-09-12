"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Clock,
  CreditCard,
  Loader2,
  MapPin,
  PackageSearch,
  Phone,
  Search,
  Truck,
  User,
  XCircle,
} from "lucide-react";
import type { OrderStatus } from "@/db/schema";
import { cn, formatDate, formatPKR, orderNumber } from "@/lib/utils";

type TrackedOrder = {
  order: {
    id: number;
    total: number;
    status: OrderStatus;
    paymentMethod: string;
    createdAt: string;
  };
  customer: {
    fullName: string;
    phone: string;
    city: string;
    address: string;
  };
  items: { id: number; name: string; price: number; quantity: number }[];
  displayNumber: string;
};

const STATUS_ICONS: Record<OrderStatus, typeof Clock> = {
  PENDING: Clock,
  CONFIRMED: PackageSearch,
  DELIVERED: CheckCircle2,
  CANCELLED: XCircle,
};

const STATUS_STYLES: Record<OrderStatus, string> = {
  PENDING: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  CONFIRMED: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
  DELIVERED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  CANCELLED: "border-red-400/30 bg-red-500/10 text-red-300",
};

const TIMELINE_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: "PENDING", label: "Order Placed", desc: "We received your order." },
  {
    status: "CONFIRMED",
    label: "Confirmed",
    desc: "Your order is confirmed and being prepared.",
  },
  {
    status: "DELIVERED",
    label: "Delivered",
    desc: "Your laptop has been delivered.",
  },
];

function StatusTimeline({ status }: { status: OrderStatus }) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 px-5 py-4">
        <XCircle className="h-5 w-5 text-red-300" />
        <div>
          <p className="text-sm font-semibold text-red-200">Order Cancelled</p>
          <p className="text-xs text-red-300/70">
            Contact us on WhatsApp for more details.
          </p>
        </div>
      </div>
    );
  }

  const activeIdx = TIMELINE_STEPS.findIndex((s) => s.status === status);

  return (
    <div className="relative">
      <div className="flex items-stretch gap-0">
        {TIMELINE_STEPS.map((step, i) => {
          const done = i <= activeIdx;
          const Icon = i === activeIdx ? STATUS_ICONS[status] : CheckCircle2;
          return (
            <div
              key={step.status}
              className="relative flex flex-1 flex-col items-center"
            >
              <div className="flex items-center w-full">
                {i > 0 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 transition-colors",
                      i <= activeIdx ? "bg-cyan-400" : "bg-white/10",
                    )}
                  />
                )}
                <span
                  className={cn(
                    "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all",
                    done
                      ? "border-cyan-400 bg-cyan-400/20 text-cyan-200"
                      : "border-white/10 bg-white/5 text-zinc-600",
                    i === activeIdx &&
                      STATUS_STYLES[status] &&
                      "border-current bg-current/10",
                  )}
                >
                  <Icon className="h-4.5 w-4.5" />
                </span>
                {i < TIMELINE_STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 transition-colors",
                      i < activeIdx ? "bg-cyan-400" : "bg-white/10",
                    )}
                  />
                )}
              </div>
              <div className="mt-3 text-center">
                <p
                  className={cn(
                    "text-xs font-semibold",
                    done ? "text-white" : "text-zinc-500",
                  )}
                >
                  {step.label}
                </p>
                <p className="mt-0.5 text-[11px] text-zinc-500">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function TrackPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<TrackedOrder | TrackedOrder[] | null>(
    null,
  );

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch(
        `/api/track?q=${encodeURIComponent(query.trim())}`,
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No order found.");
        return;
      }
      setResult(data.orders ?? data);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const orders: TrackedOrder[] = Array.isArray(result)
    ? result
    : result
      ? [result]
      : [];

  return (
    <div className="relative">
      <div className="hero-glow absolute inset-x-0 top-0 h-[360px]" />
      <div className="relative mx-auto max-w-3xl px-4 pb-24 pt-32 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            Track Your Order
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Order <span className="text-gradient">Tracking</span>
          </h1>
          <p className="mt-4 text-zinc-400">
            Enter your order number (DL-0001) or phone number to see the latest
            status.
          </p>
        </div>

        <form onSubmit={search} className="mt-10 flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-zinc-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="DL-0001 or 0310-9516681"
              className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-4 pl-12 pr-4 text-sm text-white placeholder:text-zinc-600 backdrop-blur-xl transition-colors focus:border-cyan-400/40 focus:outline-none focus:ring-0"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-4 text-sm font-semibold text-white shadow-[0_4px_20px_rgba(59,130,246,0.35)] transition-all hover:shadow-[0_4px_30px_rgba(59,130,246,0.5)] disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            Track
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-500/5 px-5 py-4 text-center text-sm text-red-300">
            {error}
          </div>
        )}

        {orders.length > 0 && (
          <div className="mt-8 space-y-6">
            {orders.map(({ order, customer, items, displayNumber }) => {
              const Icon = STATUS_ICONS[order.status] ?? Clock;
              return (
                <div
                  key={order.id}
                  className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-lg font-bold tracking-widest text-white">
                        {displayNumber}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold",
                          STATUS_STYLES[order.status],
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {order.status}
                      </span>
                    </div>
                    <span className="text-xs text-zinc-500">
                      {formatDate(order.createdAt)}
                    </span>
                  </div>

                  {/* Timeline */}
                  <div className="mt-6">
                    <StatusTimeline status={order.status} />
                  </div>

                  {/* Items */}
                  <div className="mt-6 border-t border-white/10 pt-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
                      Items
                    </p>
                    <div className="mt-3 space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 text-sm"
                        >
                          <span className="text-zinc-300">
                            <span className="font-semibold text-white">
                              {item.quantity}×
                            </span>{" "}
                            {item.name}
                          </span>
                          <span className="shrink-0 text-zinc-200">
                            {formatPKR(item.price * item.quantity)}
                          </span>
                        </div>
                      ))}
                      <div className="flex items-center justify-between border-t border-white/10 pt-2.5 text-sm">
                        <span className="font-semibold text-white">
                          Total (COD)
                        </span>
                        <span className="font-display font-bold text-white">
                          {formatPKR(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="mt-5 rounded-2xl border border-white/5 bg-white/[0.02] p-4 text-sm text-zinc-300">
                    <p className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-cyan-300/70" />{" "}
                      {customer.fullName}
                    </p>
                    <p className="mt-1 flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-cyan-300/70" />{" "}
                      {customer.phone}
                    </p>
                    <p className="mt-1 flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-cyan-300/70" />{" "}
                      {customer.address}, {customer.city}
                    </p>
                  </div>

                  {/* COD badge */}
                  <div className="mt-4 flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/5 px-4 py-2 text-xs text-cyan-300">
                    <CreditCard className="h-3.5 w-3.5" />
                    <Truck className="h-3.5 w-3.5" />
                    Pay in cash when delivered
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!result && !error && !loading && (
          <div className="mt-16 flex flex-col items-center gap-4 text-center">
            <PackageSearch className="h-12 w-12 text-zinc-600" />
            <p className="text-sm text-zinc-500">
              Enter your order reference or phone number above to track your
              order status in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
