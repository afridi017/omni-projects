import { NextResponse } from "next/server";
import { eq, or, like, sql } from "drizzle-orm";
import { db } from "@/db";
import { customers, orderItems, orders } from "@/db/schema";
import { orderNumber } from "@/lib/utils";

export const dynamic = "force-dynamic";

function digits(value: string): string {
  return value.replace(/\D+/g, "");
}

function normalizePhone(value: string): string {
  let d = digits(value);
  // Strip leading country code 92 → 0 followed by 3
  if (d.startsWith("92") && d.length === 12) d = `0${d.slice(2)}`;
  if (!d.startsWith("0")) d = `0${d}`;
  return d;
}

/**
 * Public order tracking.
 * Accepts either an order reference like "DL-0012" / "12" / "0012"
 * or a phone number like "03109516681" / "0310-9516681" / "+923109516681".
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim();

  if (q.length < 3) {
    return NextResponse.json(
      { error: "Enter an order number or phone number." },
      { status: 400 },
    );
  }

  const onlyDigitsQ = digits(q);

  try {
    // Try by order reference first.
    if (
      /^DL(-\d+)?$/i.test(q) ||
      (/^\d+$/.test(onlyDigitsQ) && onlyDigitsQ.length <= 6)
    ) {
      const numeric = Number(onlyDigitsQ);
      if (Number.isFinite(numeric) && numeric > 0) {
        const rowsByNumber = await db
          .select({ order: orders, customer: customers })
          .from(orders)
          .innerJoin(customers, eq(orders.customerId, customers.id))
          .where(eq(orders.id, numeric))
          .limit(1);
        if (rowsByNumber[0]) {
          const items = await db
            .select()
            .from(orderItems)
            .where(eq(orderItems.orderId, rowsByNumber[0].order.id));
          return NextResponse.json({
            order: rowsByNumber[0].order,
            customer: rowsByNumber[0].customer,
            items,
            displayNumber: orderNumber(rowsByNumber[0].order.id),
          });
        }
      }
    }

    // Otherwise search by phone number (partial match on the tail).
    if (onlyDigitsQ.length >= 7) {
      const normalized = normalizePhone(q);
      const last8 = normalized.slice(-8);
      const rows = await db
        .select({ order: orders, customer: customers })
        .from(orders)
        .innerJoin(customers, eq(orders.customerId, customers.id))
        .where(
          or(
            like(customers.phone, `%${last8}%`),
            like(customers.phone, `%${onlyDigitsQ}%`),
          ),
        )
        .orderBy(sql`${orders.createdAt} desc`)
        .limit(5);
      if (rows.length) {
        const itemsByOrder = await Promise.all(
          rows.map((r) =>
            db
              .select()
              .from(orderItems)
              .where(eq(orderItems.orderId, r.order.id)),
          ),
        );
        return NextResponse.json({
          orders: rows.map((r, i) => ({
            order: r.order,
            customer: r.customer,
            items: itemsByOrder[i],
            displayNumber: orderNumber(r.order.id),
          })),
        });
      }
    }

    return NextResponse.json(
      {
        error: "No order found. Double-check the order number or phone number.",
      },
      { status: 404 },
    );
  } catch {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
