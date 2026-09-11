import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { parseProductInput } from "@/lib/product-input";

export async function GET() {
  const all = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt));
  return NextResponse.json(all);
}

export async function POST(request: Request) {
  if (!(await requireAdmin(request.headers))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const raw = await request.json().catch(() => null);
  const parsed = parseProductInput(raw);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const [created] = await db.insert(products).values(parsed.data).returning();
  return NextResponse.json(created, { status: 201 });
}
