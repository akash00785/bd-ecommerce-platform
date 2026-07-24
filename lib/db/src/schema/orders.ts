import { pgTable, text, serial, timestamp, numeric, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  customerName: text("customer_name"),
  customerPhone: text("customer_phone"),
  customerEmail: text("customer_email"),
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
});

export const insertOrderSchema = createInsertSchema(ordersTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof ordersTable.$inferSelect;
