import { NextResponse } from "next/server";
import OpenAI from "openai";

let groq;
function getGroqClient() {
  if (!groq) {
    groq = new OpenAI({
      baseURL: "https://api.groq.com/openai/v1",
      apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
    });
  }
  return groq;
}

const SYSTEM_PROMPTS = {
  mcq: `You are an expert educator. Generate exactly 5 multiple-choice questions from the provided document content.
Return ONLY valid JSON — no text outside JSON:
{"questions":[{"question":"...","options":{"A":"...","B":"...","C":"...","D":"..."},"correct":"A","explanation":"..."}]}
Rules: questions must be based solely on the document, options must be plausible, explanations should quote the document.`,

  flashcard: `You are an expert educator. Generate exactly 10 flashcards from the provided document content.
Return ONLY valid JSON — no text outside JSON:
{"cards":[{"front":"concept or term","back":"clear concise explanation"}]}
Rules: fronts should be a term, concept, or question; backs should be clear and memorable.`,

  notes: `You are an expert note-taker. Create comprehensive structured study notes from the provided document.
Return ONLY valid JSON — no text outside JSON:
{"title":"...","sections":[{"heading":"...","points":["...","..."],"subpoints":{"point index as string":["...","..."]}}]}
Rules: capture ALL key concepts, organize logically, use concise bullet points under each heading.`,

  mindmap: `You are an expert at knowledge mapping. Create a mind map from the provided document.
Return ONLY valid JSON — no text outside JSON:
{"center":"main topic","branches":[{"topic":"...","color":"blue","subtopics":["...","...","..."]}]}
Rules: center is the core theme, 5-8 branches for major topics, 2-4 subtopics each, colors: blue|green|purple|orange|red|teal.`,

  interview: `You are an expert interviewer. Generate exactly 8 interview questions based on the provided document.
Return ONLY valid JSON — no text outside JSON:
{"questions":[{"question":"...","answer":"...","difficulty":"easy","type":"conceptual"}]}
Rules: mix difficulty levels (easy/medium/hard), types (conceptual/analytical/applied), answers should be thorough.`,
};

export async function POST(req) {
  try {
    const { type, pdfContent, fileName } = await req.json();

    if (!type || !pdfContent) {
      return NextResponse.json({ error: "type and pdfContent are required" }, { status: 400 });
    }

    const systemPrompt = SYSTEM_PROMPTS[type];
    if (!systemPrompt) {
      return NextResponse.json({ error: "Unknown study type" }, { status: 400 });
    }

    const userPrompt = `DOCUMENT: ${fileName || "Untitled"}\n\nCONTENT:\n${pdfContent.substring(0, 20000)}`;

    const response = await getGroqClient().chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });

    const raw = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);

    return NextResponse.json({ type, data: parsed });
  } catch (error) {
    console.error("[study route] error:", error?.message);
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}
