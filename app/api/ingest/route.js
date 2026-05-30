import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

function embedUrl() {
  return `https://generativelanguage.googleapis.com/v1/models/text-embedding-004:embedContent?key=${process.env.GOOGLE_GENERATIVE_AI_API_KEY}`;
}

async function embedOne(text) {
  const res = await fetch(embedUrl(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/text-embedding-004",
      content: { parts: [{ text }] },
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    console.error("Google Embed API error:", res.status, err);
    throw new Error(`Google Embed API ${res.status}: ${err}`);
  }
  const data = await res.json();
  return data.embedding.values;
}

// POST /api/ingest
// Body: { splitText: string[], fileId: string }
export async function POST(req) {
  try {
    const { splitText, fileId } = await req.json();

    if (!splitText?.length || !fileId) {
      return NextResponse.json({ error: "splitText and fileId required" }, { status: 400 });
    }

    // Embed sequentially to avoid rate limits
    const allVectors = [];
    for (const text of splitText) {
      allVectors.push(await embedOne(text));
    }

    // Store in Convex in batches of 20
    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
    const batchSize = 20;
    for (let i = 0; i < splitText.length; i += batchSize) {
      await convex.action(api.myActions.storeEmbeddings, {
        texts: splitText.slice(i, i + batchSize),
        vectors: allVectors.slice(i, i + batchSize),
        fileId,
      });
    }

    return NextResponse.json({ success: true, chunks: splitText.length });
  } catch (error) {
    console.error("Ingest route error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
