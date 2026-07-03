export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";
import { createEmbedding } from "@/lib/embeddings";
import { normalizePhoneNumber } from "@/lib/phone";
import { isWhatsAppMessage, stripWhatsAppPrefix } from "@/lib/whatsapp";
import { detectLanguage as detectLangCode, translateText } from "@/lib/language";
import { handleSmsOnboarding } from "@/app/api/onboarding/sms-setup/route";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

async function detectLanguage(text: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 50,
    messages: [{ role: "user", content: `What language is this? Reply with just the language name: "${text}"` }],
  });
  return response.content[0].type === "text" ? response.content[0].text.trim() : "English";
}

async function translate(text: string, lang: string): Promise<string> {
  if (lang === "English") return text;
  const r = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
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
): Promise<{ response: string; frameUrl?: string; noInfo?: boolean }> {
  let frameUrl: string | undefined;

  // Check if any chunk has a frame URL
  for (const chunk of chunks) {
    if (chunk.metadata?.frameUrl) {
      frameUrl = chunk.metadata.frameUrl;
      break;
    }
  }

  if (chunks.length === 0) {
    return { response: "", noInfo: true };
  }

  const context = chunks.map((c) => c.content).join("\n\n---\n\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
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
  try {
  const formData = await request.formData();
  const rawFrom = formData.get("From") as string;
  const body = (formData.get("Body") as string || "").trim();
  const mediaUrl = (formData.get("MediaUrl0") as string) || undefined;

  if (!rawFrom || !body) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  // Detect channel (SMS vs WhatsApp)
  const channel = isWhatsAppMessage(rawFrom) ? "whatsapp" : "sms";
  const from = stripWhatsAppPrefix(rawFrom);

  // Normalize incoming phone number to handle multiple formats
  const normalizedPhone = normalizePhoneNumber(from);
  console.log(`[${channel.toUpperCase()}] ${from} (normalized: ${normalizedPhone}): "${body}"`);

  // Check for active onboarding session or SETUP command
  const upperBody = body.toUpperCase();
  if (upperBody === "SETUP") {
    const result = await handleSmsOnboarding(from, body, mediaUrl);
    await sendSMS(from, result.message);
    return new NextResponse('<?xml version="1.0"?><Response></Response>', {
      headers: { "Content-Type": "text/xml" },
    });
  }

  const { data: onboardingSession } = await supabase
    .from("onboarding_sessions")
    .select("step")
    .eq("phone", normalizedPhone)
    .single();

  if (onboardingSession && onboardingSession.step < 5) {
    const result = await handleSmsOnboarding(from, body, mediaUrl);
    await sendSMS(from, result.message);
    return new NextResponse('<?xml version="1.0"?><Response></Response>', {
      headers: { "Content-Type": "text/xml" },
    });
  }

  // Look up worker's company by normalized phone number
  let companyId = "eds"; // Default fallback
  try {
    const { data: worker } = await supabase
      .from("workers")
      .select("company_id")
      .eq("phone", normalizedPhone)
      .single();
    
    if (worker?.company_id) {
      companyId = worker.company_id;
      console.log(`[SMS] Worker found: company_id=${companyId}`);
    }
  } catch (e) {
    console.log(`[SMS] Worker lookup failed, using default company (eds)`);
  }

  // Check if this is a manager replying to a learn session
  const { data: pendingSession } = await supabase
    .from("pending_learn_sessions")
    .select("*")
    .eq("manager_phone", normalizedPhone)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (pendingSession) {
    // Manager is teaching Sidekick
    console.log(`[SMS] Manager teaching mode: "${pendingSession.original_question}" → "${body}"`);

    // Call learn-from-manager endpoint logic inline
    const embeddingText = `Question: ${pendingSession.original_question}\nAnswer: ${body}`;
    let embedding: number[] = [];
    try {
      embedding = await createEmbedding(embeddingText);
    } catch (e) {
      console.error("[SMS] Embedding failed:", e);
    }

    const docContent = `Q: ${pendingSession.original_question}\nA: ${body}`;

    // Save to manager_knowledge
    await supabase.from("manager_knowledge").insert({
      company_id: pendingSession.company_id,
      worker_question: pendingSession.original_question,
      manager_answer: body,
      source_conversation_id: pendingSession.id,
    });

    // Save as document
    const { data: doc } = await supabase
      .from("documents")
      .insert({
        company_id: pendingSession.company_id,
        name: `Manager Reply: ${pendingSession.original_question.slice(0, 50)}`,
        content: docContent,
      })
      .select()
      .single();

    // Save as document_chunk with embedding
    const chunkInsert: Record<string, unknown> = {
      company_id: pendingSession.company_id,
      content: docContent,
      metadata: {
        source: "Manager Reply",
        original_question: pendingSession.original_question,
        worker_phone: pendingSession.worker_phone,
        document_id: doc?.id || null,
      },
    };
    if (embedding.length > 0) {
      chunkInsert.embedding = embedding;
    }
    await supabase.from("document_chunks").insert(chunkInsert);

    // Delete the pending session
    await supabase.from("pending_learn_sessions").delete().eq("id", pendingSession.id);

    // Confirm to manager
    const confirmMsg = `✅ Got it! I'll remember that '${pendingSession.original_question}' → '${body}' for next time.`;
    await sendSMS(from, confirmMsg);

    // Log interaction
    try {
      await supabase.from("interactions").insert({
        company_id: pendingSession.company_id,
        phone: normalizedPhone,
        question: `[TEACH] ${body}`,
        answer: confirmMsg,
        language: "English",
        had_image: false,
      });
    } catch (e) {
      console.error("Failed to log interaction:", e);
    }

    return new NextResponse('<?xml version="1.0"?><Response></Response>', {
      headers: { "Content-Type": "text/xml" },
    });
  }

  const lang = await detectLanguage(body);
  const chunks = await findRelevantChunks(companyId, body);
  const { response, frameUrl, noInfo } = await generateResponse(body, chunks, lang);

  let finalResponse = response;

  // If Sidekick doesn't know, check if sender is a manager and offer learn mode
  if (noInfo) {
    // Check if the sender is a manager
    const { data: senderWorker } = await supabase
      .from("workers")
      .select("role, company_id")
      .eq("phone", normalizedPhone)
      .single();

    if (senderWorker?.role === "manager") {
      // This shouldn't happen often (managers asking worker questions)
      // but handle it: manager can self-teach
      const noInfoMsg = "I don't have information about that yet. Reply with the correct answer and I'll remember it for next time.";
      finalResponse = lang === "English" ? noInfoMsg : await translate(noInfoMsg, lang);

      // Create a pending learn session for this manager
      await supabase.from("pending_learn_sessions").insert({
        company_id: companyId,
        manager_phone: normalizedPhone,
        worker_phone: normalizedPhone,
        original_question: body,
      });
    } else {
      // Worker asked something unknown - notify managers
      const noInfoMsg = "I don't have information about that yet. I've notified your manager — they can teach me the answer.";
      finalResponse = lang === "English" ? noInfoMsg : await translate(noInfoMsg, lang);

      // Find managers for this company and create learn sessions
      const { data: managers } = await supabase
        .from("workers")
        .select("phone")
        .eq("company_id", companyId)
        .eq("role", "manager");

      if (managers && managers.length > 0) {
        for (const manager of managers) {
          const mgrPhone = manager.phone;
          // Create pending learn session
          await supabase.from("pending_learn_sessions").insert({
            company_id: companyId,
            manager_phone: mgrPhone,
            worker_phone: normalizedPhone,
            original_question: body,
          });

          // Notify manager
          const notifyMsg = `📚 A worker asked: "${body}"\n\nI didn't know the answer. Reply with the correct answer and I'll remember it for next time.`;
          // Use +1 prefix if needed for sending
          const mgrSendPhone = mgrPhone.startsWith("+") ? mgrPhone : `+1${mgrPhone}`;
          await sendSMS(mgrSendPhone, notifyMsg);
        }
      }
    }
  }

  // Log interaction with normalized phone number
  try {
    await supabase.from("interactions").insert({
      company_id: companyId,
      phone: normalizedPhone,
      question: body,
      answer: finalResponse,
      language: lang,
      had_image: !!frameUrl,
    });
  } catch (e) {
    console.error("Failed to log interaction:", e);
  }

  // Send response back to sender (use original from number)
  await sendSMS(from, finalResponse, frameUrl);

  return new NextResponse('<?xml version="1.0"?><Response></Response>', {
    headers: { "Content-Type": "text/xml" },
  });
  } catch (error) {
    console.error("[SMS Webhook] Unhandled error:", error);
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response><Message>Something went wrong. Please try again.</Message></Response>',
      { headers: { "Content-Type": "text/xml" } }
    );
  }
}
