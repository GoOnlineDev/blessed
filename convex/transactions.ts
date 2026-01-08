import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    productId: v.id("products"),
    userId: v.id("users"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate quantity
    if (args.quantity <= 0) {
      throw new Error("Quantity must be greater than 0");
    }

    // Verify product exists
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    // Verify user exists
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Check stock availability
    if (product.stockQuantity < args.quantity) {
      throw new Error("Insufficient stock");
    }

    const totalSale = product.sellPrice * args.quantity;
    const totalProfit = (product.sellPrice - product.buyPrice) * args.quantity;
    const timestamp = Date.now();

    // 1. Record Transaction
    const transactionId = await ctx.db.insert("transactions", {
      productId: args.productId,
      userId: args.userId,
      quantity: args.quantity,
      totalSale,
      totalProfit,
      timestamp,
    });

    // 2. Update Stock
    await ctx.db.patch(args.productId, {
      stockQuantity: product.stockQuantity - args.quantity,
    });

    // 3. Update Daily Report
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    const existingReport = await ctx.db
      .query("dailyReports")
      .withIndex("by_date", (q) => q.eq("date", startOfDay))
      .unique();

    if (existingReport) {
      await ctx.db.patch(existingReport._id, {
        totalRevenue: existingReport.totalRevenue + totalSale,
        totalProfit: existingReport.totalProfit + totalProfit,
        totalSalesCount: existingReport.totalSalesCount + args.quantity,
      });
    } else {
      await ctx.db.insert("dailyReports", {
        date: startOfDay,
        totalRevenue: totalSale,
        totalProfit: totalProfit,
        totalSalesCount: args.quantity,
      });
    }

    return { success: true, transactionId };
  },
});

export const listRecent = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    if (args.limit <= 0) {
      throw new Error("Limit must be greater than 0");
    }

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_timestamp")
      .order("desc")
      .take(Math.min(args.limit, 100));

    // Join with products and users
    const detailedTransactions = await Promise.all(
      transactions.map(async (t) => {
        const product = await ctx.db.get(t.productId);
        const user = await ctx.db.get(t.userId);
        return {
          ...t,
          productName: product?.name || "Unknown Product",
          productSku: product?.sku || "N/A",
          userName: user?.name || "Unknown User",
        };
      })
    );

    return detailedTransactions;
  },
});

export const getByProduct = query({
  args: { productId: v.id("products"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ? Math.min(args.limit, 100) : 50;

    return await ctx.db
      .query("transactions")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .order("desc")
      .take(limit);
  },
});

export const getByUser = query({
  args: { userId: v.id("users"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ? Math.min(args.limit, 100) : 50;

    return await ctx.db
      .query("transactions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);
  },
});

export const getByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (args.startDate > args.endDate) {
      throw new Error("Start date must be before end date");
    }

    const limit = args.limit ? Math.min(args.limit, 100) : 50;

    return await ctx.db
      .query("transactions")
      .withIndex("by_timestamp")
      .filter((q) =>
        q.and(
          q.gte(q.field("timestamp"), args.startDate),
          q.lte(q.field("timestamp"), args.endDate)
        )
      )
      .order("desc")
      .take(limit);
  },
});

