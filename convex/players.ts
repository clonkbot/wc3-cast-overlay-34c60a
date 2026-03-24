import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getBySession = query({
  args: { sessionId: v.id("castSessions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("players")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();
  },
});

export const update = mutation({
  args: {
    id: v.id("players"),
    name: v.optional(v.string()),
    race: v.optional(v.string()),
    score: v.optional(v.number()),
    country: v.optional(v.string()),
    team: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const player = await ctx.db.get(args.id);
    if (!player) throw new Error("Player not found");

    const session = await ctx.db.get(player.sessionId);
    if (!session || session.userId !== userId) throw new Error("Not authorized");

    const { id, ...updates } = args;
    const filteredUpdates = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );

    await ctx.db.patch(args.id, filteredUpdates);
  },
});

export const incrementScore = mutation({
  args: { id: v.id("players") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const player = await ctx.db.get(args.id);
    if (!player) throw new Error("Player not found");

    const session = await ctx.db.get(player.sessionId);
    if (!session || session.userId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.id, { score: player.score + 1 });
  },
});

export const decrementScore = mutation({
  args: { id: v.id("players") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const player = await ctx.db.get(args.id);
    if (!player) throw new Error("Player not found");

    const session = await ctx.db.get(player.sessionId);
    if (!session || session.userId !== userId) throw new Error("Not authorized");

    await ctx.db.patch(args.id, { score: Math.max(0, player.score - 1) });
  },
});

export const resetScores = mutation({
  args: { sessionId: v.id("castSessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) throw new Error("Not authorized");

    const players = await ctx.db
      .query("players")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    for (const player of players) {
      await ctx.db.patch(player._id, { score: 0 });
    }
  },
});

export const swapPlayers = mutation({
  args: { sessionId: v.id("castSessions") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId) throw new Error("Not authorized");

    const players = await ctx.db
      .query("players")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .collect();

    if (players.length === 2) {
      const p1 = players.find(p => p.slot === 1);
      const p2 = players.find(p => p.slot === 2);

      if (p1 && p2) {
        await ctx.db.patch(p1._id, { slot: 2 });
        await ctx.db.patch(p2._id, { slot: 1 });
      }
    }
  },
});
