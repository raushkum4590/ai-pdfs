import { ConvexVectorStore } from "@langchain/community/vectorstores/convex";

import { action } from "./_generated/server.js";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";
import { v } from "convex/values";


export const ingest = action({
  args: {
    splitText:v.any(),
    fileId:v.string(),
  },  handler: async (ctx,args) => {
    await ConvexVectorStore.fromTexts(
     args.splitText,
     args.fileId,
      new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        model: "text-embedding-004", // 768 dimensions
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        title: "Document title",
    }),
      { ctx }

     
    );
     return "Completed.."
  },
});


export const search = action({
  args: {
    query: v.string(),
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const vectorStore = new ConvexVectorStore(
      new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        model: "text-embedding-004", // 768 dimensions
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        title: "Document title",
      }),
       { ctx });
  
      // Get 3 results (instead of just 1) to increase chances of finding relevant content
      const resultOne = await (await vectorStore.similaritySearch(args.query, 3))
      .filter(q=>q.metadata);
      
      console.log(resultOne);
      
      if (!resultOne || resultOne.length === 0) {
        // If no results from similarity search, return a special flag
        return JSON.stringify([{ pageContent: "NO_RESULTS_FOUND", metadata: { source: "fallback" } }]);
      }      
      return JSON.stringify(resultOne);
    } catch (error) {
      console.error("Error in search:", error);
      return JSON.stringify([{ pageContent: "ERROR_DURING_SEARCH", metadata: { source: "error" } }]);
    }
  },
});

export const getFullPdfContent = action({
  args: {
    fileId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // This is a fallback method to get all PDF content 
      // when semantic search doesn't yield good results
      const vectorStore = new ConvexVectorStore(
      new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        model: "text-embedding-004", 
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        title: "Document content",
      }),
       { ctx });
       
      // Get all content up to a reasonable limit (adjust as needed)
      const allContent = await (await vectorStore.similaritySearch("content of the document", 10))
        .filter(q=>q.metadata)
        .map(item => item.pageContent)
        .join(" ");
      
      if (!allContent || allContent.trim() === "") {
        return JSON.stringify("NO_CONTENT_AVAILABLE");
      }
      
      return JSON.stringify(allContent);
    } catch (error) {
      console.error("Error retrieving PDF content:", error);
      return JSON.stringify("ERROR_RETRIEVING_CONTENT");
    }
  },
});