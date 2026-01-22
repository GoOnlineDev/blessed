import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

/**
 * Generates a unique SKU from product name
 * Format: Uppercase, alphanumeric only, spaces/hyphens removed, max 20 chars
 * If duplicate exists, appends sequential number
 */
async function generateUniqueSku(
  ctx: MutationCtx,
  baseName: string,
  excludeProductId?: Id<"products">
): Promise<string> {
  // Create base SKU from name
  let baseSku = baseName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "") // Remove all non-alphanumeric
    .substring(0, 20); // Limit length

  if (!baseSku) {
    baseSku = "PROD"; // Fallback if name has no valid characters
  }

  // Check if base SKU exists
  let sku = baseSku;
  let counter = 1;

  while (true) {
    const existing = await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", sku))
      .first();

    // Skip if it's the product we're updating
    if (!existing || (excludeProductId && existing._id === excludeProductId)) {
      break; // SKU is unique
    }

    // Append counter, ensuring total length doesn't exceed 20
    const counterStr = counter.toString();
    const maxBaseLength = 20 - counterStr.length - 1; // -1 for the dash
    const truncatedBase = baseSku.substring(0, Math.max(0, maxBaseLength));
    sku = `${truncatedBase}-${counterStr}`;
    counter++;

    // Safety limit
    if (counter > 9999) {
      sku = `${baseSku}-${Date.now()}`;
      break;
    }
  }

  return sku;
}

export const list = query({
  args: { role: v.string() },
  handler: async (ctx, args) => {
    const products = await ctx.db.query("products").collect();

    // Mask buyPrice if not admin
    if (args.role !== "admin") {
      return products.map(({ buyPrice, ...rest }) => rest);
    }

    return products;
  },
});

export const listForInventory = query({
  args: { role: v.string() },
  handler: async (ctx, args) => {
    const products = await ctx.db.query("products").collect();

    return products;
  },
});

export const get = query({
  args: { id: v.id("products"), role: v.string() },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.id);
    if (!product) return null;

    if (args.role !== "admin") {
      const { buyPrice, ...rest } = product;
      return rest;
    }

    return product;
  },
});

export const getBySku = query({
  args: { sku: v.string(), role: v.string() },
  handler: async (ctx, args) => {
    const product = await ctx.db
      .query("products")
      .withIndex("by_sku", (q) => q.eq("sku", args.sku))
      .unique();

    if (!product) return null;

    if (args.role !== "admin") {
      const { buyPrice, ...rest } = product;
      return rest;
    }

    return product;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    buyPrice: v.number(),
    sellPrice: v.number(),
    stockQuantity: v.number(),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate unique SKU from product name
    const sku = await generateUniqueSku(ctx, args.name);

    return await ctx.db.insert("products", {
      ...args,
      sku,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("products"),
    name: v.optional(v.string()),
    buyPrice: v.optional(v.number()),
    sellPrice: v.optional(v.number()),
    stockQuantity: v.optional(v.number()),
    imageUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    // If name is being updated, regenerate SKU (excluding current product)
    if (updates.name) {
      const sku = await generateUniqueSku(ctx, updates.name, id);
      await ctx.db.patch(id, { ...updates, sku });
      return;
    }

    await ctx.db.patch(id, updates);
  },
});

export const deleteProduct = mutation({
  args: { id: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
export const seed = mutation({
  args: {
    products: v.array(
      v.object({
        name: v.string(),
        buyPrice: v.number(),
        sellPrice: v.number(),
        stockQuantity: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const results = [];
    for (const productData of args.products) {
      const sku = await generateUniqueSku(ctx, productData.name);
      const id = await ctx.db.insert("products", {
        ...productData,
        sku,
      });
      results.push(id);
    }
    return results;
  },
});
