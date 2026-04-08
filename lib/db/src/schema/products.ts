import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  price: integer("price").notNull(), // in cents, e.g. 3200 = $32.00
  imageUrl: text("image_url").notNull().default(""),
  stock: integer("stock").notNull().default(0),
  active: boolean("active").notNull().default(true),
  specs: text("specs").notNull().default("[]"), // JSON string
  contents: text("contents").notNull().default("[]"), // JSON string
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(productsTable).omit({
  id: true,
  createdAt: true,
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof productsTable.$inferSelect;
