import { NextResponse } from "next/server";
import OpenAI from "openai";

const groq = new OpenAI({
  baseURL: "https://api.groq.com/openai/v1",
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
});

const SYSTEM_PROMPT = `You are an expert document analyst. Always respond with valid JSON only — no text outside the JSON object.

Required JSON structure:
{
  "pdf_answer": { "answer": "..." },
  "ai_insights": { "answer": "..." }
}

=== PDF_ANSWER RULES ===
- Use ONLY information from the provided document context. Never use outside knowledge here.
- If the answer is not in the document, say: "The document does not contain information about this topic."
- Be specific: quote or closely paraphrase relevant parts of the document.
- Structure your answer clearly:
  * Start with a direct 1-2 sentence answer to the question.
  * Then expand with supporting details, key facts, or steps from the document.
  * Use **bold** for important terms or headings.
  * Use bullet points (start line with "* ") for lists.
  * Use numbered lists (start line with "1. ") for sequential steps.
  * Keep paragraphs short and scannable.
- End with a brief "Key Takeaway:" line summarizing the main point.

=== AI_INSIGHTS RULES ===
- Provide richer context, explanation, or broader knowledge beyond what the document says.
- Always begin with: "Based on general knowledge (not from the document):"
- Include 2-3 of the following where relevant:
  * Why this matters or real-world implications
  * A concrete example or analogy to make it clearer
  * Best practices or recommendations related to the topic
  * Comparison with industry standards or common approaches
  * Potential challenges or considerations
- Use the same formatting: **bold**, bullet points, numbered steps.
- Be insightful, not just a restatement of the PDF answer.

=== STRICT RULES ===
- Never mix PDF content and general knowledge in the same section.
- Respond ONLY with the JSON object. No preamble, no explanation outside JSON.
- Both answers must be well-structured and genuinely helpful, not generic.`;

export async function POST(req) {
  try {
    const { prompt } = await req.json();

    if (!prompt || prompt.trim() === "") {
      return NextResponse.json({ error: "Empty prompt" }, { status: 400 });
    }

    const trimmedPrompt = prompt.length > 28000 ? prompt.substring(0, 28000) : prompt;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: trimmedPrompt },
      ],
      temperature: 0.6,
      max_tokens: 4096,
      response_format: { type: "json_object" },
    });

    const rawText = response.choices[0]?.message?.content || "{}";

    let pdfAnswer = "The document does not contain information about this topic.";
    let aiInsights = "";

    try {
      const parsed = JSON.parse(rawText);
      pdfAnswer = parsed?.pdf_answer?.answer || pdfAnswer;
      aiInsights = parsed?.ai_insights?.answer || "";
    } catch {
      pdfAnswer = rawText;
    }

    return NextResponse.json({ pdfAnswer, aiInsights });
  } catch (error) {
    console.error("[chat route] error:", error?.message || error);
    return NextResponse.json({ error: error?.message || "Unknown error" }, { status: 500 });
  }
}
