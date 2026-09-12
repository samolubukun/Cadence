import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  voices: defineTable({
    orgId: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    category: v.string(), // "AUDIOBOOK", "CONVERSATIONAL", etc.
    language: v.string(),
    variant: v.union(v.literal("SYSTEM"), v.literal("CUSTOM")),
    r2ObjectKey: v.optional(v.string()),
  })
    .index("by_variant", ["variant"])
    .index("by_orgId", ["orgId"]),

  generations: defineTable({
    orgId: v.string(),
    voiceId: v.optional(v.id("voices")),
    voiceName: v.string(),
    text: v.string(),
    r2ObjectKey: v.optional(v.string()),
    modelEngine: v.optional(v.string()), // "cadence-turbo-v1"
    sampleRate: v.optional(v.number()), // 24000
    temperature: v.number(),
    topP: v.number(),
    topK: v.number(),
    repetitionPenalty: v.number(),
  })
    .index("by_orgId", ["orgId"])
    .index("by_voiceId", ["voiceId"]),

  transcriptions: defineTable({
    orgId: v.string(),
    audioKey: v.string(),
    fileName: v.string(),
    language: v.optional(v.string()),
    text: v.string(),
    modelEngine: v.optional(v.string()), // "whisper-large-v3"
    duration: v.optional(v.number()),
    status: v.union(
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    segments: v.array(
      v.object({
        start: v.number(),
        end: v.number(),
        text: v.string(),
        speaker: v.optional(v.string()),
        words: v.optional(
          v.array(
            v.object({
              word: v.string(),
              start: v.optional(v.number()),
              end: v.optional(v.number()),
              score: v.optional(v.number()),
              speaker: v.optional(v.string()),
            })
          )
        ),
      })
    ),
  }).index("by_orgId", ["orgId"]),

  credits: defineTable({
    orgId: v.string(),
    balance: v.number(),
  }).index("by_orgId", ["orgId"]),

  songs: defineTable({
    orgId: v.string(),
    title: v.string(),
    prompt: v.string(),
    lyrics: v.optional(v.string()),
    duration: v.number(),
    r2ObjectKey: v.optional(v.string()),
    status: v.union(v.literal("processing"), v.literal("completed"), v.literal("failed")),
  }).index("by_orgId", ["orgId"]),

  soundEffects: defineTable({
    orgId: v.string(),
    prompt: v.string(),
    duration: v.number(),
    r2ObjectKey: v.optional(v.string()),
    status: v.union(v.literal("processing"), v.literal("completed"), v.literal("failed")),
  }).index("by_orgId", ["orgId"]),

  voiceConversions: defineTable({
    orgId: v.string(),
    sourceAudioKey: v.optional(v.string()),
    targetVoiceKey: v.string(),
    pitchShift: v.number(),
    r2ObjectKey: v.optional(v.string()),
    status: v.union(v.literal("processing"), v.literal("completed"), v.literal("failed")),
  }).index("by_orgId", ["orgId"]),

  mediaGenerations: defineTable({
    orgId: v.string(),
    type: v.union(v.literal("image"), v.literal("video")),
    prompt: v.string(),
    aspectRatio: v.optional(v.string()),
    duration: v.optional(v.number()),
    r2ObjectKey: v.optional(v.string()),
    status: v.union(v.literal("processing"), v.literal("completed"), v.literal("failed")),
  }).index("by_orgId", ["orgId"]),
});

