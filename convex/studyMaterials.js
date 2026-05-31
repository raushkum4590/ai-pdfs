import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const save = mutation({
  args: { fileId: v.string(), createdBy: v.string(), type: v.string(), content: v.string() },
  handler: async (ctx, args) => {
    // Replace existing material of same type for this file+user
    const existing = await ctx.db
      .query("studyMaterials")
      .withIndex("byFileUserType", (q) =>
        q.eq("fileId", args.fileId).eq("createdBy", args.createdBy).eq("type", args.type)
      )
      .first();
    if (existing) await ctx.db.delete(existing._id);
    await ctx.db.insert("studyMaterials", args);
  },
});

export const getByType = query({
  args: { fileId: v.string(), createdBy: v.string(), type: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("studyMaterials")
      .withIndex("byFileUserType", (q) =>
        q.eq("fileId", args.fileId).eq("createdBy", args.createdBy).eq("type", args.type)
      )
      .first();
  },
});

export const getAllForFile = query({
  args: { fileId: v.string(), createdBy: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("studyMaterials")
      .withIndex("byFileAndUser", (q) =>
        q.eq("fileId", args.fileId).eq("createdBy", args.createdBy)
      )
      .collect();
  },
});
