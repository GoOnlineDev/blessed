import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Register a new user
export const register = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();
    const name = args.name.trim();

    if (!name) {
      throw new Error("Name is required");
    }
    if (!email) {
      throw new Error("Email is required");
    }
    if (!args.password || args.password.length < 4) {
      throw new Error("Password must be at least 4 characters");
    }

    // Check if email already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (existing) {
      throw new Error("Email already registered");
    }

    // Check if this is the first user (should be admin)
    const allUsers = await ctx.db.query("users").collect();
    const isFirstUser = allUsers.length === 0;

    const userId = await ctx.db.insert("users", {
      name,
      email,
      password: args.password, // Plain text for simplicity
      role: isFirstUser ? "admin" : "viewer",
      allowedPages: isFirstUser
        ? ["/dashboard", "/inventory", "/sales", "/reports", "/users"]
        : ["/dashboard", "/inventory"],
    });

    return { userId, isAdmin: isFirstUser };
  },
});

// Login user
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .unique();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.password !== args.password) {
      throw new Error("Invalid email or password");
    }

    return {
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      allowedPages: user.allowedPages,
    };
  },
});

// Get user by ID
export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) return null;
    // Don't return password
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      allowedPages: user.allowedPages,
    };
  },
});

// Get user by email
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase().trim()))
      .unique();
    if (!user) return null;
    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      allowedPages: user.allowedPages,
    };
  },
});

// List all users (for admin)
export const list = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    // Don't return passwords
    return users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      allowedPages: user.allowedPages,
    }));
  },
});

// Update user role and pages (admin only)
export const updateRoleAndPages = mutation({
  args: {
    id: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("editor"), v.literal("viewer")),
    allowedPages: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user) {
      throw new Error("User not found");
    }

    if (args.allowedPages.length === 0) {
      throw new Error("User must have access to at least one page");
    }

    await ctx.db.patch(args.id, {
      role: args.role,
      allowedPages: args.allowedPages,
    });
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    id: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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
      const normalizedEmail = args.email.toLowerCase().trim();
      if (!normalizedEmail) {
        throw new Error("Email cannot be empty");
      }

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
