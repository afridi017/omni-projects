import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-PK")}`;
}

export function getConditionLabel(condition: string): string {
  const labels: Record<string, string> = {
    NEW: "Brand New",
    LIKE_NEW: "Like New",
    EXCELLENT: "Excellent",
    GOOD: "Good",
  };
  return labels[condition] || condition;
}

export function getConditionColor(condition: string): string {
  const colors: Record<string, string> = {
    NEW: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    LIKE_NEW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    EXCELLENT: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    GOOD: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };
  return colors[condition] || "bg-slate-500/20 text-slate-400 border-slate-500/30";
}

export function calculateDiscount(price: number, originalPrice: number): number {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
