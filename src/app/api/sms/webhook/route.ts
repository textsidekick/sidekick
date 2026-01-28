import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";
import { createEmbedding } from "@/lib/embeddings";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

async function detectLanguage(text: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 50,
    messages: [{ role: "user", content: `What language is this? Reply with just the language name: "${text}"` }],
  });
  return response.content[0].type === "text" ? response.content[0].text.trim() : "English";
}

async function translate(text: string, lang: string): Promise<string> {
  if (lang === "English") return text;
  const r = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [{ role: "user", content: `Translate to ${lang}. Only return translation: "${text}"` }],
  });
  return r.content[0].type === "text" ? r.content[0].text : text;
}

async function findRelevantChunks(companyId: string, question: string): Promise<{ content: string; metadata: any }[]> {
  try {
    const embedding = await createEmbedding(question);

    const { data, error } = await supabase.rpc("match_documents", {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: 5,
      p_company_id: companyId,
    });

    if (error) {
      console.error("Vector search error:", error);
      // Fallback to text search
      const { data: textData } = await supabase
        .from("document_chunks")
        .select("content, metadata")
        .eq("company_id", companyId)
        .textSearch("content", question.split(" ").join(" | "));
      return textData || [];
    }

    return data || [];
  } catch (e) {
    console.error("Search error:", e);
    return [];
  }
}

async function generateResponse(
  question: string,
  chunks: { content: string; metadata: any }[],
  lang: string
): Promise<{ response: string; frameUrl?: string }> {
  let frameUrl: string | undefined;

  // Check if any chunk has a frame URL
  for (const chunk of chunks) {
    if (chunk.metadata?.frameUrl) {
      frameUrl = chunk.metadata.frameUrl;
      break;
    }
  }

  if (chunks.length === 0) {
    const msg = "I don't have information about that yet. Please check with your supervisor.";
    return { response: lang === "English" ? msg : await translate(msg, lang) };
  }

  const context = chunks.map((c) => c.content).join("\n\n---\n\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: `You are Sidekick, helping a frontline worker. Answer concisely (under 160 chars for SMS).

Context from company documents:
${context}

Question: ${question}

Give a direct, helpful answer. If it's a location question, be specific.`,
      },
    ],
  });

  let text = response.content[0].type === "text" ? response.content[0].text : "";
  if (lang !== "English") text = await translate(text, lang);

  return { response: text, frameUrl };
}

async function sendSMS(to: string, body: string, mediaUrl?: string) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return false;

  const params: Record<string, string> = {
    To: to,
    From: TWILIO_PHONE_NUMBER!,
    Body: body,
  };

  // Add media URL for MMS if we have a frame
  if (mediaUrl) {
    params.MediaUrl = mediaUrl;
  }

  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(params),
  });

  return true;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const from = formData.get("From") as string;
  const body = (formData.get("Body") as string || "").trim();

  if (!from || !body) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  console.log(`[SMS] ${from}: "${body}"`);

  // Get worker's company (default to "eds" for now)
  // TODO: Look up worker's company from database
  const companyId = "eds";

  const lang = await detectLanguage(body);
  const chunks = await findRelevantChunks(companyId, body);
  const { response, frameUrl } = await generateResponse(body, chunks, lang);

  // Log interaction
  try {
    await supabase.from("interactions").insert({
      company_id: companyId,
      phone: from,
      question: body,
      answer: response,
      language: lang,
      had_image: !!frameUrl,
    });
  } catch (e) {
    console.error("Failed to log interaction:", e);
  }

  // Send response (with image if available)
  await sendSMS(from, response, frameUrl);

  return new NextResponse('<?xml version="1.0"?><Response></Response>', {
    headers: { "Content-Type": "text/xml" },
  });
}
