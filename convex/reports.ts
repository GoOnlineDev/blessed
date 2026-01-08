import { query } from "./_generated/server";
import { v } from "convex/values";

type SalesByItemResult = {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  revenue: number;
  profit?: number;
};

export const getDailyStats = query({
  args: { role: v.string(), days: v.number() },
  handler: async (ctx, args) => {
    // Validate inputs
    if (args.days <= 0) {
      throw new Error("Days must be greater than 0");
    }

    const reports = await ctx.db
      .query("dailyReports")
      .withIndex("by_date")
      .order("desc")
      .take(Math.min(args.days, 365)); // Cap at 1 year

    // Mask profit for non-admin users
    if (args.role !== "admin") {
      return reports.map(({ totalProfit, ...rest }) => rest);
    }

    return reports;
  },
});

export const getSalesByItem = query({
  args: { role: v.string() },
  handler: async (ctx, args) => {
    const transactions = await ctx.db.query("transactions").collect();
    const products = await ctx.db.query("products").collect();

    const salesByItem: SalesByItemResult[] = products.map((product) => {
      const productTransactions = transactions.filter(
        (t) => t.productId === product._id
      );
      
      const totalQuantity = productTransactions.reduce(
        (sum, t) => sum + t.quantity,
        0
      );
      
      const totalRevenue = productTransactions.reduce(
        (sum, t) => sum + t.totalSale,
        0
      );
      
      const totalProfit = productTransactions.reduce(
        (sum, t) => sum + t.totalProfit,
        0
      );

      const result: SalesByItemResult = {
        productId: product._id,
        name: product.name,
        sku: product.sku,
        quantity: totalQuantity,
        revenue: totalRevenue,
      };

      // Only include profit for admin users
      if (args.role === "admin") {
        result.profit = totalProfit;
      }

      return result;
    });

    // Sort by revenue descending
    return salesByItem.sort((a, b) => b.revenue - a.revenue);
  },
});

export const getSalesByProduct = query({
  args: { 
    productId: v.id("products"),
    role: v.string() 
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const transactions = await ctx.db
      .query("transactions")
      .filter((q) => q.eq(q.field("productId"), args.productId))
      .collect();

    const totalQuantity = transactions.reduce(
      (sum, t) => sum + t.quantity,
      0
    );

    const totalRevenue = transactions.reduce(
      (sum, t) => sum + t.totalSale,
      0
    );

    const totalProfit = transactions.reduce(
      (sum, t) => sum + t.totalProfit,
      0
    );

    const result: {
      productId: string;
      name: string;
      sku: string;
      quantity: number;
      revenue: number;
      profit?: number;
    } = {
      productId: product._id,
      name: product.name,
      sku: product.sku,
      quantity: totalQuantity,
      revenue: totalRevenue,
    };

    if (args.role === "admin") {
      result.profit = totalProfit;
    }

    return result;
  },
});

export const getStatsForDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.startDate > args.endDate) {
      throw new Error("Start date must be before end date");
    }

    const reports = await ctx.db
      .query("dailyReports")
      .withIndex("by_date")
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), args.startDate),
          q.lte(q.field("date"), args.endDate)
        )
      )
      .collect();

    const aggregated = reports.reduce(
      (acc, report) => ({
        totalRevenue: acc.totalRevenue + report.totalRevenue,
        totalProfit: acc.totalProfit + report.totalProfit,
        totalSalesCount: acc.totalSalesCount + report.totalSalesCount,
        dayCount: acc.dayCount + 1,
      }),
      { totalRevenue: 0, totalProfit: 0, totalSalesCount: 0, dayCount: 0 }
    );

    const result: {
      totalRevenue: number;
      totalProfit?: number;
      totalSalesCount: number;
      dayCount: number;
      averageDailyRevenue: number;
      averageDailySalesCount: number;
    } = {
      totalRevenue: aggregated.totalRevenue,
      totalSalesCount: aggregated.totalSalesCount,
      dayCount: aggregated.dayCount,
      averageDailyRevenue:
        aggregated.dayCount > 0
          ? aggregated.totalRevenue / aggregated.dayCount
          : 0,
      averageDailySalesCount:
        aggregated.dayCount > 0
          ? aggregated.totalSalesCount / aggregated.dayCount
          : 0,
    };

    if (args.role === "admin") {
      result.totalProfit = aggregated.totalProfit;
    }

    return result;
  },
});

