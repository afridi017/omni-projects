import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { orders, type OrderStatus } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { getAllOrders } from "@/lib/queries";

const STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "DELIVERED", "CANCELLED"];

export async function GET(request: Request) {
  if (!requireAdmin(request.headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const all = await getAllOrders();
  return NextResponse.json(all);
}

export async function PATCH(request: Request) {
  if (!requireAdmin(request.headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = (await request.json().catch(() => ({}))) as {
    orderId?: number;
    status?: OrderStatus;
  };
  const orderId = Number(body.orderId);
  if (!Number.isFinite(orderId) || !body.status || !STATUSES.includes(body.status)) {
    return NextResponse.json({ error: "Invalid order update." }, { status: 400 });
  }
  const [updated] = await db
    .update(orders)
    .set({ status: body.status })
    .where(eq(orders.id, orderId))
    .returning();
  if (!updated) return NextResponse.json({ error: "Order not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
