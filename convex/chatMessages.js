import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const save = mutation({
  args: {
    fileId: v.string(),
    createdBy: v.string(),
    role: v.string(),
    content: v.string(),
    pdfAnswer: v.optional(v.string()),
    aiInsights: v.optional(v.string()),
    isDual: v.optional(v.boolean()),
    isError: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("chatMessages", args);
  },
});

export const getByFile = query({
  args: { fileId: v.string(), createdBy: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chatMessages")
      .withIndex("byFileAndUser", (q) =>
        q.eq("fileId", args.fileId).eq("createdBy", args.createdBy)
      )
      .collect();
  },
});

export const clearByFile = mutation({
  args: { fileId: v.string(), createdBy: v.string() },
  handler: async (ctx, args) => {
    const msgs = await ctx.db
      .query("chatMessages")
      .withIndex("byFileAndUser", (q) =>
        q.eq("fileId", args.fileId).eq("createdBy", args.createdBy)
      )
      .collect();
    await Promise.all(msgs.map((m) => ctx.db.delete(m._id)));
  },
});
