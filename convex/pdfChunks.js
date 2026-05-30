import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const store = mutation({
  args: { texts: v.array(v.string()), fileId: v.string() },
  handler: async (ctx, args) => {
    await Promise.all(
      args.texts.map((text) => ctx.db.insert("pdfChunks", { text, fileId: args.fileId }))
    );
  },
});

export const search = query({
  args: { query: v.string(), fileId: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("pdfChunks")
      .withSearchIndex("search_text", (q) =>
        q.search("text", args.query).eq("fileId", args.fileId)
      )
      .take(5);
    return results;
  },
});

export const getAll = query({
  args: { fileId: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("pdfChunks")
      .withIndex("byFileId", (q) => q.eq("fileId", args.fileId))
      .collect();
    return results.map((r) => r.text);
  },
});
