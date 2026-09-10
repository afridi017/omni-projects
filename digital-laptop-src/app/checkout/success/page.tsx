"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, MessageCircle, Package, Home } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(6);
  const [redirected, setRedirected] = useState(false);

  const orderId = searchParams.get("orderId") || "";
  const name = searchParams.get("name") || "";
  const phone = searchParams.get("phone") || "";
  const city = searchParams.get("city") || "";
  const address = searchParams.get("address") || "";
  const total = searchParams.get("total") || "0";
  const itemsRaw = searchParams.get("items");

  const items: Array<{ name: string; qty: number; price: number }> = (() => {
    try { return JSON.parse(decodeURIComponent(itemsRaw || "[]")); }
    catch { return []; }
  })();

  const buildWhatsAppURL = useCallback(() => {
    const itemsList = items.map((i) => `  • ${i.name} x${i.qty} — Rs. ${(i.price * i.qty).toLocaleString()}`).join("\n");
    const message = `🛍️ *New Order — DIGITAL LAPTOP*\n\n📦 *Order ID:* ${orderId}\n\n👤 *Customer Details:*\n• Name: ${name}\n• Phone: ${phone}\n• City: ${city}\n• Address: ${address}\n\n🛒 *Items:*\n${itemsList}\n\n💰 *Total: Rs. ${parseFloat(total).toLocaleString()}*\n💳 *Payment: Cash on Delivery (COD)*\n\nPlease confirm this order. Thank you! 🙏`;
    return `https://wa.me/923109516681?text=${encodeURIComponent(message)}`;
  }, [orderId, name, phone, city, address, total, items]);

  useEffect(() => {
    if (!orderId) return;
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          if (!redirected) {
            setRedirected(true);
            window.open(buildWhatsAppURL(), "_blank");
          }
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [orderId, buildWhatsAppURL, redirected]);

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-20 flex items-center justify-center">
        <div className="max-w-lg mx-auto px-4 py-16 text-center space-y-8">
          {/* Animated success icon */}
          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-400" />
            </div>
          </div>

          {/* Title */}
          <div>
            <h1 className="text-white text-3xl font-extrabold mb-2">Order Placed! 🎉</h1>
            <p className="text-slate-400">
              Thank you, <span className="text-white font-semibold">{name}</span>! Your order has been received.
            </p>
          </div>

          {/* Order ID */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/8 text-left space-y-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-blue-400" />
              <span className="text-slate-400 text-sm">Order ID</span>
            </div>
            <p className="text-white font-mono font-bold text-lg break-all">{orderId}</p>
            <div className="border-t border-white/8 pt-3 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Amount</span>
                <span className="text-white font-semibold">Rs. {parseFloat(total).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Payment</span>
                <span className="text-amber-400 font-medium">Cash on Delivery</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Delivery to</span>
                <span className="text-white">{city}</span>
              </div>
            </div>
          </div>

          {/* WhatsApp countdown */}
          <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20">
            <p className="text-green-400 text-sm font-medium mb-1">
              Redirecting to WhatsApp in <span className="font-bold text-base">{countdown}s</span>...
            </p>
            <p className="text-slate-400 text-xs">
              We&apos;ll send your order details to <strong>Zeeshan (0310-9516681)</strong> for confirmation.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={buildWhatsAppURL()}
              id="success-whatsapp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-green-500 text-white font-semibold hover:bg-green-400 transition-all duration-200 shadow-lg shadow-green-500/25"
            >
              <MessageCircle className="w-5 h-5" />
              Send via WhatsApp Now
            </a>
            <Link
              href="/"
              id="success-home"
              className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-semibold hover:bg-white/10 transition-all duration-200"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
