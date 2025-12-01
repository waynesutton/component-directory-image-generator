import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const applicationTables = {
  gradients: defineTable({
    name: v.string(),
    css: v.string(),
    mode: v.optional(v.union(v.literal("pastel"), v.literal("vibrant"))),
    angle: v.number(),
    stops: v.array(
      v.object({
        position: v.number(),
        color: v.string(),
      })
    ),
    tags: v.array(v.string()),
    source: v.union(v.literal("preset"), v.literal("variant")),
    grainIntensity: v.number(),
    vibrantBlur: v.optional(
      v.object({
        vibrancy: v.number(),
        blurStrength: v.number(),
        colorDensity: v.number(),
        radialSources: v.array(
          v.object({
            x: v.number(),
            y: v.number(),
            radius: v.number(),
            color: v.string(),
          })
        ),
      })
    ),
    createdAt: v.number(),
    updatedAt: v.number(),
    userId: v.optional(v.id("users")),
  }),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
