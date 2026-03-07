import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getCurrentUser, getCurrentUserOrNull } from "./lib/auth";

/**
 * Sync the current Clerk user into the Convex users table.
 * Call this when the user signs in or loads the app (e.g. from a provider).
 * Creates the user on first sign-up, updates lastSignedInAt on subsequent sign-ins.
 */
export const storeUser = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const now = Date.now();
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) =>
        q.eq("userId", identity.tokenIdentifier)
      )
      .unique();

    if (existingUser) {
      await ctx.db.patch("users", existingUser._id, {
        name: identity.name ?? existingUser.name,
        email: identity.email ?? existingUser.email,
        pictureUrl: identity.pictureUrl ?? existingUser.pictureUrl,
        lastSignedInAt: now,
      });
      return existingUser._id;
    }

    return await ctx.db.insert("users", {
      userId: identity.tokenIdentifier,
      name: identity.name ?? "Anonymous",
      email: identity.email ?? "",
      pictureUrl: identity.pictureUrl,
      createdAt: now,
      lastSignedInAt: now,
    });
  },
});

/**
 * Get the current user's profile (for use in UI).
 * Returns null if not authenticated or user not yet synced.
 */
export const getCurrentUserProfile = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUserOrNull(ctx);
  },
});
