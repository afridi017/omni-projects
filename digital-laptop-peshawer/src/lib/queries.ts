import { and, asc, count, desc, eq, gte, ilike, inArray, lte, ne, or, sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  customers,
  orderItems,
  orders,
  products,
  type Condition,
  type Customer,
  type Order,
  type OrderItem,
  type Product,
} from "@/db/schema";
import { LOW_STOCK_THRESHOLD } from "@/lib/constants";

export type ProductFilters = {
  brand?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  ram?: string;
  search?: string;
  sort?: string;
  featured?: boolean;
};

function csv(value?: string): string[] {
  return value ? value.split(",").map((v) => v.trim()).filter(Boolean) : [];
}

export async function getProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const where: SQL[] = [];

  const brands = csv(filters.brand);
  if (brands.length) where.push(inArray(products.brand, brands));

  const conds = csv(filters.condition).filter((c) =>
    ["NEW", "LIKE_NEW", "EXCELLENT", "GOOD"].includes(c),
  ) as Condition[];
  if (conds.length) where.push(inArray(products.condition, conds));

  if (filters.minPrice != null && !Number.isNaN(filters.minPrice)) {
    where.push(gte(products.price, filters.minPrice));
  }
  if (filters.maxPrice != null && !Number.isNaN(filters.maxPrice)) {
    where.push(lte(products.price, filters.maxPrice));
  }

  const rams = csv(filters.ram);
  if (rams.length) {
    where.push(or(...rams.map((r) => ilike(products.ram, `%${r}%`)))!);
  }

  if (filters.search) {
    const q = `%${filters.search}%`;
    where.push(
      or(
        ilike(products.name, q),
        ilike(products.brand, q),
        ilike(products.model, q),
        ilike(products.processor, q),
        ilike(products.gpu, q),
      )!,
    );
  }

  if (filters.featured) where.push(eq(products.featured, true));

  const orderBy =
    filters.sort === "price-asc"
      ? [asc(products.price)]
      : filters.sort === "price-desc"
        ? [desc(products.price)]
        : filters.sort === "name"
          ? [asc(products.name)]
          : [desc(products.createdAt)];

  return db
    .select()
    .from(products)
    .where(where.length ? and(...where) : undefined)
    .orderBy(...orderBy);
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  return db
    .select()
    .from(products)
    .where(eq(products.featured, true))
    .orderBy(desc(products.createdAt))
    .limit(limit);
}

export async function getProductById(id: number): Promise<Product | undefined> {
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return rows[0];
}

export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  const sameBrand = await db
    .select()
    .from(products)
    .where(and(eq(products.brand, product.brand), ne(products.id, product.id)))
    .orderBy(desc(products.createdAt))
    .limit(limit);
  if (sameBrand.length >= limit) return sameBrand;
  const fillers = await db
    .select()
    .from(products)
    .where(ne(products.id, product.id))
    .orderBy(desc(products.createdAt))
    .limit(limit * 2);
  const merged = [...sameBrand];
  for (const p of fillers) {
    if (merged.length >= limit) break;
    if (!merged.find((m) => m.id === p.id)) merged.push(p);
  }
  return merged;
}

export async function getDistinctBrands(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ brand: products.brand })
    .from(products)
    .orderBy(asc(products.brand));
  return rows.map((r) => r.brand);
}

export type OrderWithDetails = {
  order: Order;
  customer: Customer;
  items: OrderItem[];
};

export async function getOrderWithDetails(id: number): Promise<OrderWithDetails | undefined> {
  const rows = await db
    .select({ order: orders, customer: customers })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .where(eq(orders.id, id))
    .limit(1);
  if (!rows[0]) return undefined;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, id));
  return { order: rows[0].order, customer: rows[0].customer, items };
}

export async function getAllOrders(): Promise<OrderWithDetails[]> {
  const rows = await db
    .select({ order: orders, customer: customers })
    .from(orders)
    .innerJoin(customers, eq(orders.customerId, customers.id))
    .orderBy(desc(orders.createdAt));
  if (!rows.length) return [];
  const items = await db
    .select()
    .from(orderItems)
    .where(inArray(orderItems.orderId, rows.map((r) => r.order.id)));
  return rows.map((r) => ({
    order: r.order,
    customer: r.customer,
    items: items.filter((i) => i.orderId === r.order.id),
  }));
}

export type AdminStats = {
  totalProducts: number;
  totalOrders: number;
  revenue: number;
  lowStock: Product[];
};

export async function getAdminStats(): Promise<AdminStats> {
  const [productCount] = await db.select({ value: count() }).from(products);
  const [orderCount] = await db.select({ value: count() }).from(orders);
  const [rev] = await db
    .select({ value: sql<number>`coalesce(sum(${orders.total}), 0)::int` })
    .from(orders)
    .where(ne(orders.status, "CANCELLED"));
  const lowStock = await db
    .select()
    .from(products)
    .where(lte(products.stock, LOW_STOCK_THRESHOLD))
    .orderBy(asc(products.stock))
    .limit(8);
  return {
    totalProducts: productCount?.value ?? 0,
    totalOrders: orderCount?.value ?? 0,
    revenue: rev?.value ?? 0,
    lowStock,
  };
}
