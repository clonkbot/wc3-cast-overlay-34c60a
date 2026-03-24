import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // Cast sessions (matches being cast)
  castSessions: defineTable({
    userId: v.id("users"),
    name: v.string(),
    isLive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Players in a cast session
  players: defineTable({
    sessionId: v.id("castSessions"),
    slot: v.number(), // 1 or 2
    name: v.string(),
    race: v.string(), // "Human", "Orc", "Undead", "Night Elf", "Random"
    score: v.number(),
    country: v.optional(v.string()),
    team: v.optional(v.string()),
  }).index("by_session", ["sessionId"]),

  // Match history within a session
  matchHistory: defineTable({
    sessionId: v.id("castSessions"),
    winner: v.number(), // 1 or 2
    player1Race: v.string(),
    player2Race: v.string(),
    map: v.optional(v.string()),
    duration: v.optional(v.string()),
    completedAt: v.number(),
  }).index("by_session", ["sessionId"]),

  // Overlay settings
  overlaySettings: defineTable({
    sessionId: v.id("castSessions"),
    showScores: v.boolean(),
    showRaces: v.boolean(),
    showCountry: v.boolean(),
    showTeam: v.boolean(),
    theme: v.string(), // "alliance", "horde", "undead", "neutral"
    accentColor: v.string(),
  }).index("by_session", ["sessionId"]),
});
