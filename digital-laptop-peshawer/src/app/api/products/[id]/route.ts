import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { parseProductInput } from "@/lib/product-input";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: Context) {
  if (!requireAdmin(request.headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }

  const raw = await request.json().catch(() => null);

  // Lightweight partial update (e.g. featured toggle from the table).
  if (raw && typeof raw === "object" && "featured" in raw && Object.keys(raw).length === 1) {
    const [updated] = await db
      .update(products)
      .set({ featured: Boolean((raw as { featured: unknown }).featured) })
      .where(eq(products.id, productId))
      .returning();
    if (!updated) return NextResponse.json({ error: "Product not found." }, { status: 404 });
    return NextResponse.json(updated);
  }

  const parsed = parseProductInput(raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const [updated] = await db
    .update(products)
    .set(parsed.data)
    .where(eq(products.id, productId))
    .returning();
  if (!updated) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, context: Context) {
  if (!requireAdmin(request.headers)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await context.params;
  const productId = Number(id);
  if (!Number.isFinite(productId)) {
    return NextResponse.json({ error: "Invalid product id." }, { status: 400 });
  }
  const [deleted] = await db
    .delete(products)
    .where(eq(products.id, productId))
    .returning({ id: products.id });
  if (!deleted) return NextResponse.json({ error: "Product not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
