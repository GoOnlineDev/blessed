import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
    allowedPages: v.array(v.string()), // e.g., ["/dashboard", "/inventory"]
  }).index("by_email", ["email"]),

  products: defineTable({
    name: v.string(),
    sku: v.string(),
    buyPrice: v.number(),
    sellPrice: v.number(),
    stockQuantity: v.number(),
    imageUrl: v.optional(v.string()),
  }).index("by_sku", ["sku"]),

  transactions: defineTable({
    productId: v.id("products"),
    userId: v.id("users"),
    quantity: v.number(),
    totalSale: v.number(),
    totalProfit: v.number(),
    timestamp: v.number(),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_product", ["productId"])
    .index("by_user", ["userId"]),

  dailyReports: defineTable({
    date: v.number(), // timestamp at 00:00:00
    totalRevenue: v.number(),
    totalProfit: v.number(),
    totalSalesCount: v.number(),
  }).index("by_date", ["date"]),
});

