"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Banknote,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  User,
} from "lucide-react";
import { useCart } from "@/components/cart-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatPKR } from "@/lib/utils";

type Errors = Partial<Record<"fullName" | "phone" | "city" | "address" | "form", string>>;

export default function CheckoutPage() {
  const { items, hydrated, subtotal, clear } = useCart();
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", phone: "", city: "Peshawar", address: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (hydrated && items.length === 0 && !submitting) {
      router.replace("/cart");
    }
  }, [hydrated, items.length, router, submitting]);

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  function validate(): boolean {
    const next: Errors = {};
    if (form.fullName.trim().length < 3) next.fullName = "Please enter your full name.";
    if (!/^0?3\d{2}[-\s]?\d{7}$/.test(form.phone.trim()))
      next.phone = "Enter a valid mobile number (e.g. 0310-9516681).";
    if (form.city.trim().length < 2) next.city = "Please enter your city.";
    if (form.address.trim().length < 10) next.address = "Please enter your complete address.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function placeOrder() {
    if (!validate() || submitting) return;
    setSubmitting(true);
    setErrors({});
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          paymentMethod: "COD",
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ form: data.error ?? "Could not place your order. Please try again." });
        setSubmitting(false);
        return;
      }
      clear();
      router.push(`/order/success/${data.orderId}`);
    } catch {
      setErrors({ form: "Network error — please check your connection and try again." });
      setSubmitting(false);
    }
  }

  if (!hydrated || items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 pt-24">
        <div className="h-40 w-full animate-pulse rounded-3xl bg-white/[0.05]" />
      </div>
    );
  }

  const itemCount = items.reduce((a, i) => a + i.quantity, 0);

  return (
    <div className="relative">
      <div className="hero-glow absolute inset-x-0 top-0 h-[360px]" />
      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Back to cart
        </Link>
        <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Secure <span className="text-gradient">Checkout</span>
        </h1>
        <p className="mt-3 text-zinc-400">
          Cash on Delivery only — inspect your laptop, then pay. No advance needed.
        </p>

        <div className="mt-12 grid gap-8 lg:grid-cols-[1fr_380px]">
          {/* Form */}
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
            <h2 className="flex items-center gap-2.5 font-display text-lg font-semibold text-white">
              <User className="h-5 w-5 text-cyan-300" /> Customer Details
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="e.g. Muhammad Ahmad"
                  value={form.fullName}
                  onChange={set("fullName")}
                  className={cn(errors.fullName && "border-red-400/50")}
                />
                {errors.fullName && <p className="text-xs text-red-300">{errors.fullName}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input
                    id="phone"
                    inputMode="tel"
                    placeholder="03XX-XXXXXXX"
                    value={form.phone}
                    onChange={set("phone")}
                    className={cn("pl-10", errors.phone && "border-red-400/50")}
                  />
                </div>
                {errors.phone && <p className="text-xs text-red-300">{errors.phone}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Peshawar"
                  value={form.city}
                  onChange={set("city")}
                  className={cn(errors.city && "border-red-400/50")}
                />
                {errors.city && <p className="text-xs text-red-300">{errors.city}</p>}
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="address">Complete Address *</Label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500" />
                  <Textarea
                    id="address"
                    placeholder="House / street / area / landmark"
                    value={form.address}
                    onChange={set("address")}
                    className={cn("pl-10", errors.address && "border-red-400/50")}
                  />
                </div>
                {errors.address && <p className="text-xs text-red-300">{errors.address}</p>}
              </div>
            </div>

            <h2 className="mt-9 flex items-center gap-2.5 font-display text-lg font-semibold text-white">
              <Banknote className="h-5 w-5 text-cyan-300" /> Payment Method
            </h2>
            <label className="mt-5 flex cursor-pointer items-start gap-4 rounded-2xl border border-cyan-400/40 bg-cyan-400/[0.07] p-5">
              <input type="radio" checked readOnly className="mt-1 h-4 w-4 accent-cyan-400" />
              <span>
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                  Cash on Delivery (COD)
                  <span className="rounded-full bg-cyan-400/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-200">
                    Only Option
                  </span>
                </span>
                <span className="mt-1 block text-sm leading-relaxed text-zinc-400">
                  Pay in cash when your laptop is delivered to your doorstep.
                  You can check the machine before paying.
                </span>
              </span>
            </label>

            {errors.form && (
              <p className="mt-5 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {errors.form}
              </p>
            )}

            <Button
              variant="accent"
              size="lg"
              className="mt-8 w-full"
              onClick={placeOrder}
              disabled={submitting}
            >
              {submitting ? (
                <><Loader2 className="h-4.5 w-4.5 animate-spin" /> Placing your order...</>
              ) : (
                <>Place Order — {formatPKR(subtotal)}</>
              )}
            </Button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-zinc-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400/70" />
              After placing the order you&apos;ll be redirected to WhatsApp to confirm with {form.city ? "our team" : "us"}.
            </p>
          </div>

          {/* Summary */}
          <div className="h-fit rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl lg:sticky lg:top-28">
            <h2 className="flex items-center gap-2.5 font-display text-lg font-semibold text-white">
              <ShoppingBag className="h-5 w-5 text-cyan-300" /> Order Summary
            </h2>
            <div className="mt-5 space-y-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3.5">
                  <div className="relative h-14 w-[70px] shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0a0c12]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image ?? "/images/hero-laptop.jpg"} alt={item.name} className="h-full w-full object-cover" />
                    <span className="absolute right-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black/70 px-1 text-[10px] font-bold text-white">
                      ×{item.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-xs font-medium leading-snug text-zinc-200">{item.name}</p>
                  </div>
                  <p className="shrink-0 text-xs font-semibold text-white">
                    {formatPKR(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-2.5 border-t border-white/10 pt-4 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})</span>
                <span className="text-white">{formatPKR(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Delivery</span>
                <span className="text-emerald-300">Free</span>
              </div>
              <div className="flex justify-between pt-1.5">
                <span className="font-semibold text-white">Total</span>
                <span className="font-display text-xl font-bold text-white">{formatPKR(subtotal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
