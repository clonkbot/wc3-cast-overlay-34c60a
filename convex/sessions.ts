import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query("castSessions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("castSessions") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByIdPublic = query({
  args: { id: v.id("castSessions") },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.id);
    if (!session) return null;

    const players = await ctx.db
      .query("players")
      .withIndex("by_session", (q) => q.eq("sessionId", args.id))
      .collect();

    const settings = await ctx.db
      .query("overlaySettings")
      .withIndex("by_session", (q) => q.eq("sessionId", args.id))
      .first();

    return { session, players, settings };
  },
});

export const create = mutation({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const now = Date.now();
    const sessionId = await ctx.db.insert("castSessions", {
      userId,
      name: args.name,
      isLive: false,
      createdAt: now,
      updatedAt: now,
    });

    // Create default players
    await ctx.db.insert("players", {
      sessionId,
      slot: 1,
      name: "Player 1",
      race: "Random",
      score: 0,
    });

    await ctx.db.insert("players", {
      sessionId,
      slot: 2,
      name: "Player 2",
      race: "Random",
      score: 0,
    });

    // Create default settings
    await ctx.db.insert("overlaySettings", {
      sessionId,
      showScores: true,
      showRaces: true,
      showCountry: false,
      showTeam: false,
      theme: "neutral",
      accentColor: "#c9a227",
    });

    return sessionId;
  },
});

export const update = mutation({
  args: {
    id: v.id("castSessions"),
    name: v.optional(v.string()),
    isLive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.id);
    if (!session || session.userId !== userId) throw new Error("Not found");

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.isLive !== undefined) updates.isLive = args.isLive;

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("castSessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.id);
    if (!session || session.userId !== userId) throw new Error("Not found");

    // Delete related data
    const players = await ctx.db
      .query("players")
      .withIndex("by_session", (q) => q.eq("sessionId", args.id))
      .collect();
    for (const player of players) {
      await ctx.db.delete(player._id);
    }

    const matches = await ctx.db
      .query("matchHistory")
      .withIndex("by_session", (q) => q.eq("sessionId", args.id))
      .collect();
    for (const match of matches) {
      await ctx.db.delete(match._id);
    }

    const settings = await ctx.db
      .query("overlaySettings")
      .withIndex("by_session", (q) => q.eq("sessionId", args.id))
      .first();
    if (settings) {
      await ctx.db.delete(settings._id);
    }

    await ctx.db.delete(args.id);
  },
});
