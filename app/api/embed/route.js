import { NextResponse } from "next/server";

// URL is built at call-time so the env var is always resolved after server start
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
  return data.embedding.values; // number[]
}

// Embed an array of texts sequentially (avoids rate limits)
async function embedAll(texts) {
  const results = [];
  for (const text of texts) {
    results.push(await embedOne(text));
  }
  return results;
}

// POST /api/embed
// Body: { text: string } → { embedding: number[] }
//       { texts: string[] } → { embeddings: number[][] }
export async function POST(req) {
  try {
    const body = await req.json();

    if (body.texts) {
      const embeddings = await embedAll(body.texts);
      return NextResponse.json({ embeddings });
    }

    if (body.text) {
      const embedding = await embedOne(body.text);
      return NextResponse.json({ embedding });
    }

    return NextResponse.json({ error: "Provide text or texts" }, { status: 400 });
  } catch (error) {
    console.error("Embed route error:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
