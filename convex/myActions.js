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
      // Enhanced method to get all PDF content with better coverage
      const vectorStore = new ConvexVectorStore(
      new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        model: "text-embedding-004", 
        taskType: TaskType.RETRIEVAL_DOCUMENT,
        title: "Document content",
      }),
       { ctx });
       
      // Try multiple strategic queries to get comprehensive coverage of the document
      // This helps retrieve content from different parts of the document
      const queries = [
        "content of the document",
        "document text",
        "main points",
        "introduction section",
        "conclusion section"
      ];
      
      // Execute all queries in parallel for better performance
      const resultsArray = await Promise.all(
        queries.map(query => vectorStore.similaritySearch(query, 10))
      );
      
      // Combine all results and handle any undefined/null values
      let allResults = [];
      resultsArray.forEach(results => {
        if (results && Array.isArray(results)) {
          allResults = [...allResults, ...results];
        }
      });
      
      // Filter and deduplicate results - improved algorithm
      const seenContent = new Set();
      const uniqueContent = allResults
        .filter(item => item && item.metadata && item.pageContent) // Ensure valid items
        .filter(item => {
          // More robust deduplication using first 100 chars as signature
          const contentSignature = item.pageContent.substring(0, 100).trim();
          if (seenContent.has(contentSignature)) return false;
          seenContent.add(contentSignature);
          return true;
        })
        .map(item => item.pageContent);
      
      const allContent = uniqueContent.join(" ");
      
      if (!allContent || allContent.trim() === "") {
        console.warn("No content found for document ID:", args.fileId);
        return JSON.stringify("NO_CONTENT_AVAILABLE");
      }
      
      console.log(`Retrieved ${uniqueContent.length} unique content sections for document ID: ${args.fileId}`);
      return JSON.stringify(allContent);
    } catch (error) {
      console.error("Error retrieving PDF content:", error, error.stack);
      return JSON.stringify("ERROR_RETRIEVING_CONTENT");
    }
  },
});