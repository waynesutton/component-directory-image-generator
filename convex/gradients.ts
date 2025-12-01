import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Default Image preset configuration
const DEFAULT_IMAGE_PRESET = {
  name: "Default Image",
  angle: 135,
  stops: [
    { position: 0, color: "#fdcbba" },
    { position: 40, color: "#fbe0c1" },
    { position: 100, color: "#fdf2e2" },
  ],
  tags: ["warm", "soft", "default"],
  grainIntensity: 0.15,
  mode: "pastel" as const,
};

const PRESET_GRADIENTS = [
  DEFAULT_IMAGE_PRESET,
  {
    name: "Rose Garden",
    angle: 315,
    stops: [
      { position: 0, color: "#fce4ec" },
      { position: 35, color: "#f8bbd9" },
      { position: 70, color: "#f48fb1" },
      { position: 100, color: "#ec407a" },
    ],
    tags: ["pink", "floral", "soft"],
    grainIntensity: 0.12,
    mode: "pastel" as const,
  },
  {
    name: "Forest Mist",
    angle: 90,
    stops: [
      { position: 0, color: "#134e5e" },
      { position: 100, color: "#71b280" },
    ],
    tags: ["cool", "nature"],
    grainIntensity: 0.25,
    mode: "pastel" as const,
  },
  {
    name: "Golden Hour",
    angle: 45,
    stops: [
      { position: 0, color: "#f6d365" },
      { position: 100, color: "#fda085" },
    ],
    tags: ["warm", "sunset"],
    grainIntensity: 0.15,
    mode: "pastel" as const,
  },
  {
    name: "Arctic Aurora",
    angle: 135,
    stops: [
      { position: 0, color: "#43cea2" },
      { position: 50, color: "#185a9d" },
      { position: 100, color: "#43cea2" },
    ],
    tags: ["cool", "northern lights"],
    grainIntensity: 0.2,
    mode: "vibrant" as const,
  },
  {
    name: "Dusk Purple",
    angle: 180,
    stops: [
      { position: 0, color: "#667eea" },
      { position: 100, color: "#764ba2" },
    ],
    tags: ["cool", "evening"],
    grainIntensity: 0.15,
    mode: "vibrant" as const,
  },
  {
    name: "Peach Blossom",
    angle: 120,
    stops: [
      { position: 0, color: "#ffecd2" },
      { position: 100, color: "#fcb69f" },
    ],
    tags: ["warm", "pastel"],
    grainIntensity: 0.12,
    mode: "pastel" as const,
  },
  {
    name: "Mint Lavender",
    angle: 60,
    stops: [
      { position: 0, color: "#a8edea" },
      { position: 100, color: "#fed6e3" },
    ],
    tags: ["pastel", "fresh"],
    grainIntensity: 0.1,
    mode: "pastel" as const,
  },
  {
    name: "Ocean Breeze",
    angle: 180,
    stops: [
      { position: 0, color: "#667eea" },
      { position: 50, color: "#764ba2" },
      { position: 100, color: "#f093fb" },
    ],
    tags: ["cool", "vibrant"],
    grainIntensity: 0.15,
    mode: "vibrant" as const,
  },
  {
    name: "Sunset Coral",
    angle: 135,
    stops: [
      { position: 0, color: "#ff6b6b" },
      { position: 50, color: "#feca57" },
      { position: 100, color: "#ee5a6f" },
    ],
    tags: ["warm", "vibrant"],
    grainIntensity: 0.2,
    mode: "vibrant" as const,
  },
];

// Helper function to generate CSS gradient string
function generateGradientCSS(gradient: {
  angle: number;
  stops: Array<{ position: number; color: string }>;
}) {
  const stopsCSS = gradient.stops
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(", ");
  return `linear-gradient(${gradient.angle}deg, ${stopsCSS})`;
}

// Initialize all presets when database is empty
export const initializePresets = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existingGradients = await ctx.db.query("gradients").collect();
    
    if (existingGradients.length === 0) {
      const now = Date.now();
      for (const preset of PRESET_GRADIENTS) {
        await ctx.db.insert("gradients", {
          name: preset.name,
          css: generateGradientCSS(preset),
          angle: preset.angle,
          stops: preset.stops,
          tags: preset.tags,
          source: "preset",
          grainIntensity: preset.grainIntensity,
          mode: preset.mode,
          createdAt: now,
          updatedAt: now,
        });
      }
    }
    return null;
  },
});

// Add Default Image preset if it doesn't exist
export const ensureDefaultImagePreset = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const existing = await ctx.db
      .query("gradients")
      .filter((q) => q.eq(q.field("name"), "Default Image"))
      .first();
    
    if (!existing) {
      const now = Date.now();
      await ctx.db.insert("gradients", {
        name: DEFAULT_IMAGE_PRESET.name,
        css: generateGradientCSS(DEFAULT_IMAGE_PRESET),
        angle: DEFAULT_IMAGE_PRESET.angle,
        stops: DEFAULT_IMAGE_PRESET.stops,
        tags: DEFAULT_IMAGE_PRESET.tags,
        source: "preset",
        grainIntensity: DEFAULT_IMAGE_PRESET.grainIntensity,
        mode: DEFAULT_IMAGE_PRESET.mode,
        createdAt: now,
        updatedAt: now,
      });
    }
    return null;
  },
});

// List all gradients, ordered by creation time descending
export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("gradients"),
      _creationTime: v.number(),
      name: v.string(),
      css: v.string(),
      angle: v.number(),
      stops: v.array(v.object({ position: v.number(), color: v.string() })),
      tags: v.array(v.string()),
      source: v.union(v.literal("preset"), v.literal("variant")),
      grainIntensity: v.number(),
      mode: v.optional(v.union(v.literal("pastel"), v.literal("vibrant"))),
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
    })
  ),
  handler: async (ctx) => {
    const gradients = await ctx.db.query("gradients").order("desc").collect();
    return gradients;
  },
});

// Get a single gradient by ID
export const getGradient = query({
  args: { id: v.id("gradients") },
  returns: v.union(
    v.object({
      _id: v.id("gradients"),
      _creationTime: v.number(),
      name: v.string(),
      css: v.string(),
      angle: v.number(),
      stops: v.array(v.object({ position: v.number(), color: v.string() })),
      tags: v.array(v.string()),
      source: v.union(v.literal("preset"), v.literal("variant")),
      grainIntensity: v.number(),
      mode: v.optional(v.union(v.literal("pastel"), v.literal("vibrant"))),
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
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Get the default gradient (Default Image or first available)
export const getDefaultGradient = query({
  args: {},
  returns: v.union(
    v.object({
      _id: v.id("gradients"),
      _creationTime: v.number(),
      name: v.string(),
      css: v.string(),
      angle: v.number(),
      stops: v.array(v.object({ position: v.number(), color: v.string() })),
      tags: v.array(v.string()),
      source: v.union(v.literal("preset"), v.literal("variant")),
      grainIntensity: v.number(),
      mode: v.optional(v.union(v.literal("pastel"), v.literal("vibrant"))),
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
    v.null()
  ),
  handler: async (ctx) => {
    // First try to find Default Image preset
    const defaultGradient = await ctx.db
      .query("gradients")
      .filter((q) => q.eq(q.field("name"), "Default Image"))
      .first();
    
    if (defaultGradient) {
      return defaultGradient;
    }

    // Fallback to first gradient
    const firstGradient = await ctx.db.query("gradients").first();
    return firstGradient;
  },
});

// Create a new gradient
export const create = mutation({
  args: {
    name: v.string(),
    angle: v.number(),
    stops: v.array(
      v.object({
        position: v.number(),
        color: v.string(),
      })
    ),
    tags: v.array(v.string()),
    grainIntensity: v.number(),
    mode: v.optional(v.union(v.literal("pastel"), v.literal("vibrant"))),
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
  },
  returns: v.id("gradients"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    const now = Date.now();
    const css = generateGradientCSS(args);

    return await ctx.db.insert("gradients", {
      name: args.name,
      css,
      angle: args.angle,
      stops: args.stops,
      tags: args.tags,
      source: "variant",
      grainIntensity: args.grainIntensity,
      mode: args.mode,
      vibrantBlur: args.vibrantBlur,
      createdAt: now,
      updatedAt: now,
      userId: userId || undefined,
    });
  },
});

// Update an existing gradient
export const update = mutation({
  args: {
    id: v.id("gradients"),
    name: v.optional(v.string()),
    angle: v.optional(v.number()),
    stops: v.optional(
      v.array(
        v.object({
          position: v.number(),
          color: v.string(),
        })
      )
    ),
    tags: v.optional(v.array(v.string())),
    grainIntensity: v.optional(v.number()),
    mode: v.optional(v.union(v.literal("pastel"), v.literal("vibrant"))),
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
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const gradient = await ctx.db.get(id);
    
    if (!gradient) {
      throw new Error("Gradient not found");
    }

    const updatedGradient = { ...gradient, ...updates };
    const css = generateGradientCSS(updatedGradient);

    await ctx.db.patch(id, {
      ...updates,
      css,
      updatedAt: Date.now(),
    });
    return null;
  },
});

// Delete a gradient
export const remove = mutation({
  args: { id: v.id("gradients") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return null;
  },
});

// Add new presets (calls initializePresets)
export const addNewPresets = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // First ensure Default Image preset exists
    const existing = await ctx.db
      .query("gradients")
      .filter((q) => q.eq(q.field("name"), "Default Image"))
      .first();
    
    if (!existing) {
      const now = Date.now();
      await ctx.db.insert("gradients", {
        name: DEFAULT_IMAGE_PRESET.name,
        css: generateGradientCSS(DEFAULT_IMAGE_PRESET),
        angle: DEFAULT_IMAGE_PRESET.angle,
        stops: DEFAULT_IMAGE_PRESET.stops,
        tags: DEFAULT_IMAGE_PRESET.tags,
        source: "preset",
        grainIntensity: DEFAULT_IMAGE_PRESET.grainIntensity,
        mode: DEFAULT_IMAGE_PRESET.mode,
        createdAt: now,
        updatedAt: now,
      });
    }
    return null;
  },
});
