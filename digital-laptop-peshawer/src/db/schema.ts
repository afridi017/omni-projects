import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const conditionEnum = pgEnum("condition", [
  "NEW",
  "LIKE_NEW",
  "EXCELLENT",
  "GOOD",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "CONFIRMED",
  "DELIVERED",
  "CANCELLED",
]);

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  price: integer("price").notNull(),
  originalPrice: integer("original_price"),
  condition: conditionEnum("condition").notNull().default("NEW"),
  stock: integer("stock").notNull().default(0),
  processor: text("processor").notNull(),
  ram: text("ram").notNull(),
  storage: text("storage").notNull(),
  gpu: text("gpu").notNull(),
  display: text("display").notNull(),
  battery: text("battery"),
  description: text("description").notNull(),
  warranty: text("warranty").notNull().default("1 Month Service Warranty"),
  images: text("images")
    .array()
    .notNull()
    .default(sql`'{}'::text[]`),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id")
    .notNull()
    .references(() => customers.id),
  total: integer("total").notNull(),
  status: orderStatusEnum("status").notNull().default("PENDING"),
  paymentMethod: text("payment_method").notNull().default("COD"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  price: integer("price").notNull(),
  quantity: integer("quantity").notNull(),
});

export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Condition = (typeof conditionEnum.enumValues)[number];
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
