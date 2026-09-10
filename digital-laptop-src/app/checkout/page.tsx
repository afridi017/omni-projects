"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useCart } from "@/components/cart/CartProvider";
import { formatPKR } from "@/lib/utils";
import { Truck, Phone, MapPin, User, ArrowRight, ShieldCheck } from "lucide-react";

interface FormData {
  fullName: string;
  phone: string;
  city: string;
  address: string;
}

export default function CheckoutPage() {
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const router = useRouter();
  const [form, setForm] = useState<FormData>({ fullName: "", phone: "", city: "", address: "" });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);

  if (items.length === 0) {
    if (typeof window !== "undefined") router.push("/cart");
    return null;
  }

  function validate(): boolean {
    const e: Partial<FormData> = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.phone.trim() || !/^[0-9+\-\s]{10,15}$/.test(form.phone.trim())) e.phone = "Valid phone number required";
    if (!form.city.trim()) e.city = "City is required";
    if (!form.address.trim() || form.address.trim().length < 10) e.address = "Please enter a complete address";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.fullName,
          customerPhone: form.phone,
          customerCity: form.city,
          customerAddress: form.address,
          items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
        }),
      });

      if (!response.ok) throw new Error("Failed to place order");
      const order = await response.json();

      clearCart();
      router.push(`/checkout/success?orderId=${order.id}&name=${encodeURIComponent(form.fullName)}&phone=${encodeURIComponent(form.phone)}&city=${encodeURIComponent(form.city)}&address=${encodeURIComponent(form.address)}&total=${totalPrice}&items=${encodeURIComponent(JSON.stringify(items.map(i => ({ name: i.product.name, qty: i.quantity, price: i.product.price }))))}`);
    } catch (err) {
      alert("Failed to place order. Please try again or contact us on WhatsApp.");
      setLoading(false);
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500/60 focus:bg-white/8 transition-all duration-200";
  const errorClass = "text-red-400 text-xs mt-1";

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-white mb-8">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left: Customer Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Info */}
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/8 space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-5 h-5 text-blue-400" />
                    <h2 className="text-white font-semibold text-lg">Customer Details</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-slate-400 text-xs uppercase tracking-wider mb-1.5 block">Full Name *</label>
                      <input
                        id="checkout-name"
                        type="text"
                        placeholder="e.g. Ahmad Khan"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                        className={inputClass}
                      />
                      {errors.fullName && <p className={errorClass}>{errors.fullName}</p>}
                    </div>

                    <div>
                      <label className="text-slate-400 text-xs uppercase tracking-wider mb-1.5 block">Phone Number *</label>
                      <input
                        id="checkout-phone"
                        type="tel"
                        placeholder="e.g. 0300-1234567"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className={inputClass}
                      />
                      {errors.phone && <p className={errorClass}>{errors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 text-xs uppercase tracking-wider mb-1.5 block">City *</label>
                    <input
                      id="checkout-city"
                      type="text"
                      placeholder="e.g. Peshawar"
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                      className={inputClass}
                    />
                    {errors.city && <p className={errorClass}>{errors.city}</p>}
                  </div>

                  <div>
                    <label className="text-slate-400 text-xs uppercase tracking-wider mb-1.5 block">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        Complete Address *
                      </span>
                    </label>
                    <textarea
                      id="checkout-address"
                      rows={3}
                      placeholder="Street, Mohalla, Landmark..."
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className={`${inputClass} resize-none`}
                    />
                    {errors.address && <p className={errorClass}>{errors.address}</p>}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/8">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="w-5 h-5 text-blue-400" />
                    <h2 className="text-white font-semibold text-lg">Payment Method</h2>
                  </div>
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    </div>
                    <div>
                      <p className="text-amber-400 font-semibold">Cash on Delivery (COD)</p>
                      <p className="text-slate-400 text-xs">Pay when your order arrives. No advance payment.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Order Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  <div className="p-6 rounded-2xl bg-slate-900/60 border border-white/8">
                    <h2 className="text-white font-bold text-lg mb-4">Order Summary</h2>

                    <div className="space-y-3 mb-4">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex items-center gap-3">
                          <div className="relative w-12 h-10 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                            <Image
                              src={item.product.images?.[0] || "/placeholder-laptop.jpg"}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-xs font-medium truncate">{item.product.name}</p>
                            <p className="text-slate-400 text-xs">x{item.quantity}</p>
                          </div>
                          <p className="text-white text-sm font-semibold flex-shrink-0">{formatPKR(item.product.price * item.quantity)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/8 pt-4 space-y-2">
                      <div className="flex justify-between text-slate-400 text-sm">
                        <span>Subtotal ({totalItems} items)</span>
                        <span>{formatPKR(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400 text-sm">
                        <span>Delivery</span>
                        <span className="text-emerald-400">Free</span>
                      </div>
                      <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/8">
                        <span>Total</span>
                        <span>{formatPKR(totalPrice)}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    id="place-order-btn"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-400 hover:to-blue-500 transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Placing Order...
                      </span>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        Place Order — COD
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-2 text-slate-500 text-xs justify-center">
                    <Phone className="w-3 h-3" />
                    <span>
                      Need help?{" "}
                      <a href="https://wa.me/923109516681" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">
                        WhatsApp us
                      </a>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
