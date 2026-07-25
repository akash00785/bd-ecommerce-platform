import { pgTable, text, serial, timestamp, numeric, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
  userId: text("user_id"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull(),
  shippingFee: numeric("shipping_fee", { precision: 12, scale: 2 }).notNull().default("0"),
  discountAmount: numeric("discount_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  paymentMethod: text("payment_method").notNull().default("cod"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  orderStatus: text("order_status").notNull().default("pending"),
  shippingAddress: jsonb("shipping_address").notNull(),
  items: jsonb("items").notNull(),
  couponCode: text("coupon_code"),
  trackingId: text("tracking_id"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
}, (table) => ({
  orderStatusIdx: index("orders_order_status_idx").on(table.orderStatus),
  customerEmailIdx: index("orders_customer_email_idx").on(table.customerEmail),
  createdAtIdx: index("orders_created_at_idx").on(table.createdAt),
}));

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
