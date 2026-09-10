import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Condition } from "@/db/schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPKR(value: number): string {
  return `Rs. ${value.toLocaleString("en-US")}`;
}

export const CONDITION_LABELS: Record<Condition, string> = {
  NEW: "Brand New",
  LIKE_NEW: "Like New",
  EXCELLENT: "Excellent",
  GOOD: "Good",
};

export function conditionLabel(condition: Condition): string {
  return CONDITION_LABELS[condition] ?? condition;
}

export function orderNumber(id: number): string {
  return `DL-${String(id).padStart(4, "0")}`;
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
