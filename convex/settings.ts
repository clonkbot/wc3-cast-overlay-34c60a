import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getBySession = query({
  args: { sessionId: v.id("castSessions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("overlaySettings")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();
  },
});

export const update = mutation({
  args: {
    sessionId: v.id("castSessions"),
    showScores: v.optional(v.boolean()),
    showRaces: v.optional(v.boolean()),
    showCountry: v.optional(v.boolean()),
    showTeam: v.optional(v.boolean()),
    theme: v.optional(v.string()),
    accentColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) throw new Error("Not authorized");

    const settings = await ctx.db
      .query("overlaySettings")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!settings) throw new Error("Settings not found");

    const { sessionId, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );

    await ctx.db.patch(settings._id, filteredUpdates);
  },
});
