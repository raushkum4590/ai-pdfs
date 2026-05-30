import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import { WebPDFLoader } from "@langchain/community/document_loaders/web/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

// GET /api/migrate?email=your@email.com
// Re-ingests all existing PDFs for a user into the pdfChunks table.
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email") || "3570kumarraushan@gmail.com";

  try {
    const files = await convex.query(api.fileStorage.GetUserFiles, { userEmail: email });

    const results = [];

    for (const file of files) {
      try {
        // Skip if already ingested
        const existing = await convex.query(api.pdfChunks.getAll, { fileId: file.fileId });
        if (existing.length > 0) {
          results.push({ file: file.fileName, status: "skipped", chunks: existing.length });
          continue;
        }

        // Fetch PDF and extract text
        const response = await fetch(file.fileUrl);
        const blob = await response.blob();
        const loader = new WebPDFLoader(blob);
        const docs = await loader.load();
        const text = docs.map((d) => d.pageContent).join(" ");

        // Split into chunks
        const splitter = new RecursiveCharacterTextSplitter({
          chunkSize: 1000,
          chunkOverlap: 200,
        });
        const output = await splitter.createDocuments([text]);
        const splitText = output.map((d) => d.pageContent).filter((t) => t.trim().length > 20);

        if (splitText.length === 0) {
          results.push({ file: file.fileName, status: "empty_pdf" });
          continue;
        }

        // Store chunks in Convex
        await convex.action(api.myActions.ingest, { splitText, fileId: file.fileId });
        results.push({ file: file.fileName, fileId: file.fileId, status: "done", chunks: splitText.length });
      } catch (err) {
        results.push({ file: file.fileName, status: "error", error: err.message });
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
