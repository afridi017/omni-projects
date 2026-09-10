"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, MessageCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COUNTDOWN_SECONDS = 6;

export function WhatsAppRedirect({ waUrl }: { waUrl: string }) {
  const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
  const [cancelled, setCancelled] = useState(false);

  useEffect(() => {
    if (cancelled) return;
    if (seconds <= 0) {
      window.location.href = waUrl;
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, cancelled, waUrl]);

  return (
    <div className="mt-8 flex flex-col items-center gap-5 rounded-3xl border border-emerald-400/20 bg-emerald-400/[0.05] p-8 text-center backdrop-blur-xl">
      <p className="text-sm text-zinc-300">
        {cancelled ? (
          "Auto-redirect paused. Tap the button below whenever you're ready."
        ) : (
          <>
            Redirecting to <span className="font-semibold text-emerald-300">WhatsApp</span> in{" "}
            <span className="font-display text-lg font-bold text-white">{seconds}s</span> to confirm
            your order with our team...
          </>
        )}
      </p>
      <a
        href={waUrl}
        className={cn(buttonVariants({ variant: "accent", size: "lg" }), "w-full sm:w-auto")}
      >
        <MessageCircle className="h-5 w-5" /> Confirm Order on WhatsApp Now
      </a>
      <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
        {!cancelled && (
          <button
            onClick={() => setCancelled(true)}
            className="text-zinc-500 underline-offset-4 transition-colors hover:text-zinc-300 hover:underline"
          >
            Stay on this page
          </button>
        )}
        <Link
          href="/shop"
          className="inline-flex items-center gap-1.5 text-zinc-300 transition-colors hover:text-white"
        >
          Continue shopping <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
