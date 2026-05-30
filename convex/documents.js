import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

export const insertEmbedding = internalMutation({
  args: {
    embedding: v.array(v.number()),
    text: v.string(),
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("documents", {
      embedding: args.embedding,
      text: args.text,
      metadata: { fileId: args.fileId },
      fileId: args.fileId,
    });
  },
});

export const getById = internalQuery({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => ctx.db.get(args.id),
});

export const getAllTextByFileId = internalQuery({
  args: { fileId: v.string() },
  handler: async (ctx, args) => {
    const docs = await ctx.db
      .query("documents")
      .withIndex("byFileId", (q) => q.eq("fileId", args.fileId))
      .collect();
    return docs.map((d) => d.text);
  },
});
