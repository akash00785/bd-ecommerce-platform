import { pgTable, text, serial, timestamp, integer, numeric, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  discountPrice: numeric("discount_price", { precision: 12, scale: 2 }),
  stock: integer("stock").notNull().default(0),
  soldOut: boolean("sold_out").notNull().default(false),
  images: text("images").array().notNull().default([]),
  categoryId: integer("category_id"),
  brandId: integer("brand_id"),
  sizes: text("sizes").array().notNull().default([]),
  colors: text("colors").array().notNull().default([]),
  description: text("description"),
  warranty: text("warranty"),
  deliveryTime: text("delivery_time"),
  returnPolicy: text("return_policy"),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").notNull().default(0),
  featured: boolean("featured").notNull().default(false),
  flashSale: boolean("flash_sale").notNull().default(false),
  flashSaleEndsAt: timestamp("flash_sale_ends_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
