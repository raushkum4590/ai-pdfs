import { action } from "./_generated/server.js";
import { api } from "./_generated/api.js";
import { v } from "convex/values";

// Stores PDF text chunks using Convex full-text search (no embeddings needed).
export const ingest = action({
  args: {
    splitText: v.array(v.string()),
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`[ingest] fileId=${args.fileId} chunks=${args.splitText.length}`);
    const batchSize = 50;
    for (let i = 0; i < args.splitText.length; i += batchSize) {
      await ctx.runMutation(api.pdfChunks.store, {
        texts: args.splitText.slice(i, i + batchSize),
        fileId: args.fileId,
      });
    }
    console.log(`[ingest] done storing ${args.splitText.length} chunks for fileId=${args.fileId}`);
    return "Completed..";
  },
});

// Full-text search over PDF chunks — no external API, runs entirely in Convex.
export const search = action({
  args: {
    query: v.string(),
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const results = await ctx.runQuery(api.pdfChunks.search, {
        query: args.query,
        fileId: args.fileId,
      });

      if (!results || results.length === 0) {
        return JSON.stringify([{ pageContent: "NO_RESULTS_FOUND", metadata: {} }]);
      }

      return JSON.stringify(
        results.map((r) => ({ pageContent: r.text, metadata: { fileId: r.fileId } }))
      );
    } catch (error) {
      console.error("Search error:", error);
      return JSON.stringify([{ pageContent: "ERROR_DURING_SEARCH", metadata: {} }]);
    }
  },
});

// Returns all text chunks for the file — used as fallback when search finds nothing.
export const getFullPdfContent = action({
  args: { fileId: v.string() },
  handler: async (ctx, args) => {
    try {
      const texts = await ctx.runQuery(api.pdfChunks.getAll, { fileId: args.fileId });

      if (!texts || texts.length === 0) {
        return JSON.stringify("NO_CONTENT_AVAILABLE");
      }

      return JSON.stringify(texts.join(" "));
    } catch (error) {
      console.error("getFullPdfContent error:", error);
      return JSON.stringify("ERROR_RETRIEVING_CONTENT");
    }
  },
});

// Legacy aliases kept so old generated API references still compile.
export const storeEmbeddings = ingest;
export const searchByVector = search;
