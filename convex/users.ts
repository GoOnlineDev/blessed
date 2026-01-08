import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate inputs
    if (!args.name.trim()) {
      throw new Error("Name is required");
    }

    if (!args.email.trim()) {
      throw new Error("Email is required");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(args.email)) {
      throw new Error("Invalid email format");
    }

    if (!args.passwordHash) {
      throw new Error("Password hash is required");
    }

    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase().trim()))
      .unique();

    if (existing) {
      throw new Error("User with this email already exists");
    }

    // First user becomes admin, others are viewers by default
    const firstUser = await ctx.db.query("users").first();
    const role = firstUser ? "viewer" : "admin";

    // Default pages for first admin or regular viewer
    const allowedPages = role === "admin"
      ? ["/dashboard", "/inventory", "/sales", "/reports", "/users"]
      : ["/dashboard", "/inventory"];

    const userId = await ctx.db.insert("users", {
      name: args.name.trim(),
      email: args.email.toLowerCase().trim(),
      passwordHash: args.passwordHash,
      role,
      allowedPages,
    });

    return userId;
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase().trim()))
      .unique();
  },
});

export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) {
      return null;
    }
    return user;
  },
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const updateRoleAndPages = mutation({
  args: {
    id: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
    allowedPages: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify user exists
    const user = await ctx.db.get(args.id);
    if (!user) {
      throw new Error(`Failed to update security: User with ID ${args.id} not found.`);
    }

    // Validate allowedPages is not empty
    if (args.allowedPages.length === 0) {
      throw new Error("Security Violation: Every user must have access to at least one system endpoint.");
    }

    // Ensure valid role
    const validRoles = ["admin", "editor", "viewer"];
    if (!validRoles.includes(args.role)) {
      throw new Error(`Security Violation: Invalid role '${args.role}' specified.`);
    }

    await ctx.db.patch(args.id, {
      role: args.role,
      allowedPages: args.allowedPages,
    });
  },
});

export const updateProfile = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Verify user exists
    const user = await ctx.db.get(args.id);
    if (!user) {
      throw new Error("User not found");
    }

    const updates: { name?: string; email?: string } = {};

    if (args.name !== undefined) {
      if (!args.name.trim()) {
        throw new Error("Name cannot be empty");
      }
      updates.name = args.name.trim();
    }

    if (args.email !== undefined) {
      if (!args.email.trim()) {
        throw new Error("Email cannot be empty");
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(args.email)) {
        throw new Error("Invalid email format");
      }

      const normalizedEmail = args.email.toLowerCase().trim();

      // Check if email is already taken by another user
      const existing = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", normalizedEmail))
        .unique();

      if (existing && existing._id !== args.id) {
        throw new Error("Email is already in use");
      }

      updates.email = normalizedEmail;
    }

    if (Object.keys(updates).length === 0) {
      throw new Error("No fields to update");
    }

    await ctx.db.patch(args.id, updates);
  },
});

