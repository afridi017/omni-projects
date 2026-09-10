import { NextResponse } from "next/server";
import { and, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { customers, orderItems, orders, products } from "@/db/schema";
import { orderNumber } from "@/lib/utils";

type IncomingItem = { productId: number; quantity: number };

export async function POST(request: Request) {
  let body: {
    fullName?: string;
    phone?: string;
    city?: string;
    address?: string;
    items?: IncomingItem[];
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const fullName = body.fullName?.trim() ?? "";
  const phone = body.phone?.trim() ?? "";
  const city = body.city?.trim() ?? "";
  const address = body.address?.trim() ?? "";
  const items = Array.isArray(body.items) ? body.items : [];

  if (fullName.length < 3) {
    return NextResponse.json({ error: "Please provide your full name." }, { status: 400 });
  }
  if (!/^0?3\d{2}[-\s]?\d{7}$/.test(phone)) {
    return NextResponse.json({ error: "Please provide a valid phone number." }, { status: 400 });
  }
  if (city.length < 2) {
    return NextResponse.json({ error: "Please provide your city." }, { status: 400 });
  }
  if (address.length < 10) {
    return NextResponse.json({ error: "Please provide your complete address." }, { status: 400 });
  }
  if (!items.length) {
    return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
  }

  try {
    const result = await db.transaction(async (tx) => {
      let total = 0;
      const lineItems: { productId: number; name: string; price: number; quantity: number }[] = [];

      for (const item of items) {
        const productId = Number(item.productId);
        const quantity = Math.max(1, Math.min(10, Math.floor(Number(item.quantity) || 1)));
        if (!Number.isFinite(productId)) throw new Error("INVALID_PRODUCT");

        const [product] = await tx
          .select()
          .from(products)
          .where(eq(products.id, productId))
          .limit(1);
        if (!product) throw new Error("INVALID_PRODUCT");
        if (product.stock < quantity) throw new Error(`OUT_OF_STOCK:${product.name}`);

        // Atomically reserve stock — fails if another order took it first.
        const [updated] = await tx
          .update(products)
          .set({ stock: sql`${products.stock} - ${quantity}` })
          .where(and(eq(products.id, productId), gte(products.stock, quantity)))
          .returning({ id: products.id });
        if (!updated) throw new Error(`OUT_OF_STOCK:${product.name}`);

        total += product.price * quantity;
        lineItems.push({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
        });
      }

      const [customer] = await tx
        .insert(customers)
        .values({ fullName, phone, city, address })
        .returning();

      const [order] = await tx
        .insert(orders)
        .values({ customerId: customer.id, total, paymentMethod: "COD", status: "PENDING" })
        .returning();

      await tx.insert(orderItems).values(
        lineItems.map((li) => ({
          orderId: order.id,
          productId: li.productId,
          name: li.name,
          price: li.price,
          quantity: li.quantity,
        })),
      );

      return { orderId: order.id };
    });

    return NextResponse.json({
      ok: true,
      orderId: result.orderId,
      orderNumber: orderNumber(result.orderId),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.startsWith("OUT_OF_STOCK:")) {
      return NextResponse.json(
        { error: `Sorry — "${message.split(":")[1]}" just went out of stock. Please adjust your cart.` },
        { status: 409 },
      );
    }
    if (message === "INVALID_PRODUCT") {
      return NextResponse.json({ error: "One of the items is no longer available." }, { status: 409 });
    }
    console.error("Order creation failed:", error);
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
  }
}
