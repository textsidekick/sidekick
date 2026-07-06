export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import twilio from "twilio";
import { supabase } from "@/lib/supabase";
import { createEmbedding } from "@/lib/embeddings";
import { normalizePhoneNumber } from "@/lib/phone";
import { checkRateLimit } from "@/lib/rate-limit";
import { auditLog } from "@/lib/audit";
import { fireWebhooks } from "@/lib/webhooks";
import { triageIncomingMessage } from "@/lib/ai-triage";
import {
  assignWorkOrder,
  createWorkOrderFromTriage,
  findBestTechnician,
  handleWorkOrderCompletion,
} from "@/lib/work-order-manager";
import type { Asset as OpsAsset, UUID } from "@/types/operations";
import { detectLanguage, translateText } from "@/lib/language";
import {
  getTrainingCoachFollowUpKind,
  isTrainingCoachRequest,
  TRAINING_COACH_FOLLOW_UP_TOPIC,
  TRAINING_COACH_TOPIC,
} from "@/lib/training-coach";
import {
  getCompanyRuntimeSettings,
  getPriorityProfile,
  normalizeCompanyPriorityProfiles,
  shouldSendManagerWorkOrderAlert,
} from "@/lib/company-settings";
import { detectCriticalIncident, getCriticalIncidentMeta } from "@/lib/critical-incident";
import {
  completeJsonOpenAIFirst,
  completeTextOpenAIFirst,
  completeVisionTextOpenAIFirst,
} from "@/lib/sms-ai";
import { captureKnowledge } from "@/lib/knowledge-engine";
import { handleSmsOnboarding } from "@/app/api/onboarding/sms-setup/route";
import { isWhatsAppMessage, stripWhatsAppPrefix } from "@/lib/whatsapp";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || 'placeholder' });
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID || 'AC00000000000000000000000000000000', process.env.TWILIO_AUTH_TOKEN || 'placeholder');

const LOW_CONFIDENCE_PHRASES = [
  "don't have information",
  "do not have information",
  "couldn't find",
  "could not find",
  "no information",
  "check with your manager",
  "not sure",
  "don't know",
  "do not know",
  "unable to find",
  "not mentioned",
  "doesn't appear",
  "does not appear",
  "no details",
  "not specified",
  "consult the employee handbook",
  "consult your manager"
];

// Safety keywords that should always surface warnings
const SAFETY_KEYWORDS = [
  "lockout", "tagout", "loto", "ppe", "hazard", "chemical", "msds", "sds",
  "forklift", "crane", "lift", "hot work", "confined space", "fall protection",
  "electrical", "arc flash", "pressure", "hydraulic", "pneumatic"
];

function isLowConfidenceAnswer(answer: string): boolean {
  const lowerAnswer = answer.toLowerCase();
  return LOW_CONFIDENCE_PHRASES.some(phrase => lowerAnswer.includes(phrase));
}

function containsSafetyTopic(text: string): boolean {
  const lower = text.toLowerCase();
  return SAFETY_KEYWORDS.some(keyword => lower.includes(keyword));
}

function cleanUpdateString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function shouldTreatAsManagerUpdate(body: string, company: { manager_phone?: string | null } | null, from: string) {
  if (!company?.manager_phone || company.manager_phone !== from) return false;
  return /^(update|team|asset|knowledge|sop|policy|note)\b/i.test(body.trim());
}

async function applyManagerSmsUpdate(params: {
  companyId: string;
  company: any;
  message: string;
}) {
  const system = `You are Sidekick's manager update parser.
Turn a manager's freeform update into structured operational changes.
Return JSON only.

Schema:
{
  "summary": "short one-sentence summary of what changed",
  "company": {
    "name": "optional",
    "industry": "optional",
    "manager_name": "optional",
    "manager_phone": "optional",
    "worker_count": 0
  },
  "assets": [{ "name": "required", "asset_tag": "optional", "location": "optional", "type": "optional", "notes": "optional" }],
  "team": [{ "name": "optional", "phone": "optional", "role": "operator|technician|supervisor|manager", "skills": ["optional"], "shift": "optional" }],
  "knowledge": [{ "title": "required", "problem": "optional", "solution": "required", "asset_name": "optional", "equipment_type": "optional", "tags": ["optional"] }],
  "notes": ["short factual leftovers"]
}`;

  const parsedText = await completeJsonOpenAIFirst({
    system,
    user: `Current company context:\n${JSON.stringify(params.company || {}, null, 2)}\n\nManager update:\n${params.message}`,
    maxTokens: 900,
  });

  const match = parsedText.match(/\{[\s\S]*\}/);
  const parsed = match ? JSON.parse(match[0]) : JSON.parse(parsedText);

  const companyPatch: Record<string, unknown> = {};
  const nextName = cleanUpdateString(parsed.company?.name);
  const nextIndustry = cleanUpdateString(parsed.company?.industry);
  const nextManagerName = cleanUpdateString(parsed.company?.manager_name);
  const nextManagerPhoneRaw = cleanUpdateString(parsed.company?.manager_phone);
  const nextWorkerCount = parsed.company?.worker_count;

  if (nextName) companyPatch.name = nextName;
  if (nextIndustry) companyPatch.industry = nextIndustry;
  if (nextManagerName) companyPatch.manager_name = nextManagerName;
  if (nextManagerPhoneRaw) {
    try { companyPatch.manager_phone = normalizePhoneNumber(nextManagerPhoneRaw); } catch { companyPatch.manager_phone = nextManagerPhoneRaw; }
  }
  if (nextWorkerCount !== undefined && nextWorkerCount !== null && `${nextWorkerCount}`.trim() !== "") {
    const numeric = Number(nextWorkerCount);
    if (Number.isFinite(numeric)) companyPatch.worker_count = numeric;
  }
  if (Object.keys(companyPatch).length > 0) {
    await supabase.from("companies").update(companyPatch).eq("id", params.companyId);
  }

  let assetsChanged = 0;
  for (const [index, rawAsset] of ((parsed.assets || []) as any[]).entries()) {
    const name = cleanUpdateString(rawAsset?.name);
    if (!name) continue;
    const { data: existingAsset } = await supabase.from("assets").select("id").eq("company_id", params.companyId).ilike("name", name).limit(1).maybeSingle();
    const payload = {
      name,
      type: cleanUpdateString(rawAsset?.type) || "equipment",
      location: cleanUpdateString(rawAsset?.location) || "Unassigned",
      notes: cleanUpdateString(rawAsset?.notes),
    };
    if (existingAsset?.id) {
      await supabase.from("assets").update(payload).eq("id", existingAsset.id);
    } else {
      await supabase.from("assets").insert({
        company_id: params.companyId,
        ...payload,
        asset_tag: cleanUpdateString(rawAsset?.asset_tag) || `ASSET-${Date.now().toString().slice(-6)}-${index + 1}`,
        status: "operational",
        health_score: 100,
      } as any);
    }
    assetsChanged += 1;
  }

  let teamChanged = 0;
  const teamRows = ((parsed.team || []) as any[])
    .map((member) => {
      const phoneRaw = cleanUpdateString(member?.phone);
      if (!phoneRaw) return null;
      let phone = phoneRaw;
      try { phone = normalizePhoneNumber(phoneRaw); } catch {}
      return {
        company_id: params.companyId,
        name: cleanUpdateString(member?.name),
        phone,
        role: cleanUpdateString(member?.role) || "operator",
        skills: Array.isArray(member?.skills) ? member.skills.map((skill: unknown) => cleanUpdateString(skill)).filter(Boolean) : [],
        shift: cleanUpdateString(member?.shift),
        verified: true,
      };
    })
    .filter(Boolean);
  if (teamRows.length > 0) {
    const { data } = await supabase.from("workers").upsert(teamRows as any[], { onConflict: "phone" }).select("id");
    teamChanged = data?.length || teamRows.length;
  }

  let knowledgeAdded = 0;
  for (const rawKnowledge of (parsed.knowledge || []) as any[]) {
    const solution = cleanUpdateString(rawKnowledge?.solution);
    const title = cleanUpdateString(rawKnowledge?.title) || cleanUpdateString(rawKnowledge?.problem) || "Operational note";
    if (!solution) continue;
    const tags = Array.isArray(rawKnowledge?.tags) ? rawKnowledge.tags.map((tag: unknown) => cleanUpdateString(tag)).filter(Boolean) : [];
    const { error } = await supabase.from("knowledge_articles").insert({
      company_id: params.companyId,
      title,
      problem: cleanUpdateString(rawKnowledge?.problem) || title,
      solution,
      asset_name: cleanUpdateString(rawKnowledge?.asset_name),
      equipment_type: cleanUpdateString(rawKnowledge?.equipment_type),
      parts_used: [],
      tags,
    } as any);
    if (!error) knowledgeAdded += 1;
  }

  return {
    summary: cleanUpdateString(parsed.summary) || "Saved manager update.",
    assetsChanged,
    teamChanged,
    knowledgeAdded,
  };
}

function audioFilenameForMediaType(mediaType: string | null | undefined): string {
  const normalized = (mediaType || "").toLowerCase();
  if (normalized.includes("webm")) return "audio.webm";
  if (normalized.includes("mpeg") || normalized.includes("mp3")) return "audio.mp3";
  if (normalized.includes("wav")) return "audio.wav";
  if (normalized.includes("m4a") || normalized.includes("mp4")) return "audio.m4a";
  if (normalized.includes("ogg")) return "audio.ogg";
  if (normalized.includes("amr")) return "audio.amr";
  return "audio.bin";
}

async function transcribeAudio(buffer: Buffer, mediaType: string | null | undefined): Promise<string> {
  const deepgramApiKey = process.env.DEEPGRAM_API_KEY;

  try {
    const transcription = await openai.audio.transcriptions.create({
      file: new File([new Uint8Array(buffer)], audioFilenameForMediaType(mediaType), { type: mediaType || "application/octet-stream" }),
      model: "whisper-1",
    });

    return transcription.text || "";
  } catch (openAiError) {
    console.error("[SMS] OpenAI transcription failed:", openAiError);

    if (!deepgramApiKey || deepgramApiKey === "placeholder") {
      throw openAiError;
    }
  }

  const deepgramResponse = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true", {
    method: "POST",
    headers: {
      "Authorization": `Token ${deepgramApiKey}`,
      "Content-Type": mediaType || "audio/amr",
    },
    body: new Uint8Array(buffer),
  });

  if (!deepgramResponse.ok) {
    const errText = await deepgramResponse.text();
    throw new Error(`Deepgram: ${errText.slice(0, 100)}`);
  }

  const deepgramResult = await deepgramResponse.json();
  return deepgramResult?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
}

async function insertQuestionRecord(payload: Record<string, unknown>) {
  const firstAttempt = await supabase
    .from("questions")
    .insert(payload)
    .select()
    .single();

  if (!firstAttempt.error) return firstAttempt;

  const unsupportedFieldError =
    firstAttempt.error.code === "42703" &&
    /questions\.(channel|topic)/i.test(firstAttempt.error.message || "");

  if (!unsupportedFieldError) return firstAttempt;

  const fallbackPayload = { ...payload };
  delete fallbackPayload.channel;
  delete fallbackPayload.topic;

  return supabase
    .from("questions")
    .insert(fallbackPayload)
    .select()
    .single();
}

// ============================================
// Image Analysis Types (shared with AI triage)
// ============================================
interface ImageAnalysis {
  description: string;
  searchQueries: string[];
  isSafetyRelated: boolean;
  identifiedItems: string[];
}

// ============================================
// Safety Checklist Configuration
// ============================================
const CHECKLIST_ITEMS = [
  { id: "ppe", label: "PPE on", emoji: "" },
  { id: "loto", label: "LOTO performed", emoji: "" },
  { id: "equipment", label: "Equipment inspected", emoji: "" },
];

function parseChecklistResponse(response: string): { ppe: boolean | null; loto: boolean | null; equipment: boolean | null } {
  const normalized = response.toUpperCase().replace(/[^YN]/g, " ").trim().split(/\s+/);
  
  return {
    ppe: normalized[0] === "Y" ? true : normalized[0] === "N" ? false : null,
    loto: normalized[1] === "Y" ? true : normalized[1] === "N" ? false : null,
    equipment: normalized[2] === "Y" ? true : normalized[2] === "N" ? false : null,
  };
}

function formatChecklistResult(results: { ppe: boolean | null; loto: boolean | null; equipment: boolean | null }): { message: string; hasFailures: boolean; failures: string[] } {
  const failures: string[] = [];
  let message = "";
  
  // PPE
  if (results.ppe === true) {
    message += "OK PPE: Good\n";
  } else if (results.ppe === false) {
    message += "NOT OK PPE: NOT WORN\n";
    failures.push("PPE not worn");
  } else {
    message += "️ PPE: No response\n";
  }
  
  // LOTO
  if (results.loto === true) {
    message += "OK LOTO: Good\n";
  } else if (results.loto === false) {
    message += "NOT OK LOTO: NOT PERFORMED\n";
    failures.push("LOTO not performed");
  } else {
    message += "️ LOTO: No response\n";
  }
  
  // Equipment
  if (results.equipment === true) {
    message += "OK Equipment: Good";
  } else if (results.equipment === false) {
    message += "NOT OK Equipment: NOT INSPECTED";
    failures.push("Equipment not inspected");
  } else {
    message += "️ Equipment: No response";
  }
  
  return { message, hasFailures: failures.length > 0, failures };
}


async function searchDocuments(question: string, companyId: string) {
  let data: any[] | null = null;

  try {
    const embedding = await createEmbedding(question);
    const vectorResult = await supabase.rpc("match_documents", {
      query_embedding: embedding,
      match_company_id: companyId,
      match_count: 5,
    });

    if (vectorResult.error) {
      console.error("Vector search error:", vectorResult.error);
    } else {
      data = vectorResult.data || [];
    }
  } catch (error) {
    console.error("[SMS] Embedding search failed, falling back to text search:", error);
  }

  if (!data || data.length === 0) {
    const searchTerms = question
      .split(/\s+/)
      .map((term) => term.trim())
      .filter((term) => term.length > 2)
      .join(" | ");

    if (searchTerms) {
      const fallbackResult = await supabase
        .from("document_chunks")
        .select("document_id, content")
        .eq("company_id", companyId)
        .textSearch("content", searchTerms)
        .limit(5);

      if (fallbackResult.error) {
        console.error("[SMS] Text search fallback failed:", fallbackResult.error);
        return [];
      }

      data = (fallbackResult.data || []).map((chunk: any) => ({
        ...chunk,
        similarity: 0,
      }));
    }
  }

  // Enrich with document names for source attribution
  if (data && data.length > 0) {
    const documentIds = [...new Set(data.map((d: any) => d.document_id))];
    const { data: docs } = await supabase
      .from("documents")
      .select("id, name")
      .in("id", documentIds);
    
    const docNameMap = new Map(docs?.map((d: any) => [d.id, d.name]) || []);
    
    return data.map((chunk: any) => ({
      ...chunk,
      document_name: docNameMap.get(chunk.document_id) || null,
    }));
  }

  return data || [];
}

// ============================================
// NEW: Image Analysis Functions
// ============================================

async function fetchImageAsBase64(mediaUrl: string): Promise<{ base64: string; mediaType: string } | null> {
  try {
    // Twilio requires authentication to fetch media
    const response = await fetch(mediaUrl, {
      headers: {
        "Authorization": `Basic ${Buffer.from(
          `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
        ).toString("base64")}`,
      },
    });
    
    if (!response.ok) {
      console.error("[SMS] Failed to fetch image:", response.status);
      return null;
    }
    
    const contentType = response.headers.get("content-type") || "image/jpeg";
    const arrayBuffer = await response.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    
    return { base64, mediaType: contentType };
  } catch (error) {
    console.error("[SMS] Error fetching image:", error);
    return null;
  }
}

async function analyzeImage(base64: string, mediaType: string, workerQuestion?: string): Promise<ImageAnalysis> {
  const analysisPrompt = `You are Sidekick, an expert workplace assistant. Analyze this image from a team member at work.

${workerQuestion ? `The worker asked: "${workerQuestion}"` : "The worker sent this image without a question."}

Provide a JSON response with:
1. "description": Brief description of what you see (equipment, parts, conditions, any visible text/labels)
2. "searchQueries": Array of 2-4 search queries to find relevant SOPs, manuals, or safety procedures (e.g., "forklift safety procedure", "hydraulic press maintenance", "part number 12345")
3. "isSafetyRelated": Boolean - true if this involves safety equipment, hazards, PPE, lockout/tagout, or dangerous conditions
4. "identifiedItems": Array of specific items identified (part numbers, equipment names, tool types, PPE items)

Focus on manufacturing context: machines, parts, tools, safety equipment, work conditions.
If you see warning labels, part numbers, or equipment names, include them.

Respond ONLY with valid JSON, no markdown or explanation.`;

  try {
    const text = await completeVisionTextOpenAIFirst({
      prompt: analysisPrompt,
      base64,
      mediaType,
      maxTokens: 500,
    });
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    // Fallback if JSON parsing fails
    return {
      description: text,
      searchQueries: [workerQuestion || "equipment identification"],
      isSafetyRelated: false,
      identifiedItems: [],
    };
  } catch (error) {
    console.error("[SMS] Image analysis error:", error);
    return {
      description: "Unable to analyze image",
      searchQueries: [workerQuestion || "general inquiry"],
      isSafetyRelated: false,
      identifiedItems: [],
    };
  }
}

async function generateImageResponse(
  imageAnalysis: ImageAnalysis,
  relevantChunks: any[],
  workerName: string,
  companyName: string,
  workerQuestion?: string
): Promise<string> {
  const context = relevantChunks.map((c: any) => c.content).join("\n\n");
  
  // Get unique source documents for attribution
  const sourceDocuments = [...new Set(relevantChunks
    .map((c: any) => c.document_name)
    .filter(Boolean)
  )];
  const sourcesHint = sourceDocuments.length > 0 
    ? `\nIf using company docs, cite the source: ${sourceDocuments.join(", ")}`
    : "";
  
  // Build a direct, confident response based on what we identified
  const identifiedItems = imageAnalysis.identifiedItems.length > 0 
    ? imageAnalysis.identifiedItems.join(", ")
    : null;

  const systemPrompt = `You are Sidekick, a helpful workplace assistant. Give a SHORT, DIRECT answer (under 400 chars).

You analyzed a worker's photo and found:
- What you see: ${imageAnalysis.description}
- Specific items: ${identifiedItems || "not specifically identified"}
- Safety concern: ${imageAnalysis.isSafetyRelated ? "YES" : "no"}

${workerQuestion ? `Worker asked: "${workerQuestion}"` : "Worker wants to know about this item."}

RESPOND DIRECTLY. Examples of GOOD responses:
- "Those are Phillips head screws. You'll need a #2 Phillips screwdriver."
- "That's a 3/8" hex bolt. Use a 9/16" wrench or socket."
- "Per Safety Manual: ️ Hydraulic line - depressurize before disconnecting."

DO NOT say "I don't have information" - you DO have information from the image analysis above.
DO NOT ask clarifying questions - just answer based on what you see.${sourcesHint}
${context ? `\nCompany docs that might help:\n${context}` : ""}`;

  try {
    const answer = await completeTextOpenAIFirst({
      user: systemPrompt,
      maxTokens: 300,
    });
    if (answer) {
      // If model still hedges, use our fallback
      if (answer.toLowerCase().includes("don't have") || answer.toLowerCase().includes("cannot identify")) {
        return buildDirectResponse(imageAnalysis, workerQuestion);
      }
      return answer;
    }
  } catch (error) {
    console.error("[SMS] OpenAI error for image response:", error);
  }

  return buildDirectResponse(imageAnalysis, workerQuestion);
}

function buildDirectResponse(imageAnalysis: ImageAnalysis, workerQuestion?: string): string {
  const { description, identifiedItems, isSafetyRelated } = imageAnalysis;
  
  // Build the most helpful response we can from the analysis
  const items = identifiedItems.length > 0 ? identifiedItems.join(", ") : description;
  
  if (isSafetyRelated) {
    return `️ I see: ${items}. Check safety procedures before proceeding.`;
  }
  
  // Try to give tool suggestions based on common items
  const lowerDesc = description.toLowerCase();
  if (lowerDesc.includes("screw") && lowerDesc.includes("phillips")) {
    return `Those are Phillips head screws. You'll need a #2 Phillips screwdriver.`;
  }
  if (lowerDesc.includes("screw") && lowerDesc.includes("flat")) {
    return `Those are flathead screws. You'll need a flathead/slotted screwdriver.`;
  }
  if (lowerDesc.includes("bolt") || lowerDesc.includes("hex")) {
    return `I see hex bolts. You'll need a socket wrench or combination wrench in the matching size.`;
  }
  if (lowerDesc.includes("screw")) {
    return `I see screws - looks like Phillips head. You'll need a Phillips screwdriver (#1 or #2 depending on size).`;
  }
  
  return `I see: ${items}. What specifically would you like to know?`;
}

// ============================================
// END: Image Analysis Functions
// ============================================

async function getAIResponse(systemPrompt: string, userMessage: string): Promise<string> {
  try {
    return await completeTextOpenAIFirst({
      system: systemPrompt,
      user: userMessage,
      maxTokens: 300,
    });
  } catch (error) {
    console.error("[SMS] AI response error:", error);
    return "Sorry, I'm having trouble right now. Please try again in a moment.";
  }
}

async function sendSMS(to: string, body: string) {
  try {
    await twilioClient.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    return true;
  } catch (error) {
    console.error("[SMS] Failed to send:", error);
    return false;
  }
}

async function saveToKnowledgeBase(companyId: string, question: string, answer: string) {
  try {
    const chunk = `Q: ${question}\nA: ${answer}`;
    const embedding = await createEmbedding(chunk);
    
    let { data: doc } = await supabase
      .from("documents")
      .select("id")
      .eq("company_id", companyId)
      .eq("name", "Manager Answers")
      .single();
    
    if (!doc) {
      const { data: newDoc } = await supabase
        .from("documents")
        .insert({
          company_id: companyId,
          name: "Manager Answers",
          content: chunk,
        })
        .select()
        .single();
      doc = newDoc;
    }
    
    if (doc) {
      await supabase.from("document_chunks").insert({
        document_id: doc.id,
        company_id: companyId,
        content: chunk,
        embedding: embedding,
      });
    }
    
    console.log("[SMS] Saved manager answer to knowledge base");
    return true;
  } catch (error) {
    console.error("[SMS] Failed to save to knowledge base:", error);
    return false;
  }
}

function buildTwilioParams(params: URLSearchParams): Record<string, string> {
  const values: Record<string, string> = {};
  for (const [key, value] of params.entries()) {
    values[key] = value;
  }
  return values;
}

function getTwilioCandidateUrls(request: NextRequest): string[] {
  const urls = new Set<string>();
  urls.add(request.url);

  const requestUrl = new URL(request.url);
  const hosts = [request.headers.get("x-forwarded-host"), request.headers.get("host")].filter(Boolean) as string[];
  const protos = [request.headers.get("x-forwarded-proto"), requestUrl.protocol.replace(/:$/, "")].filter(Boolean) as string[];

  for (const host of hosts) {
    for (const proto of protos) {
      const url = new URL(request.url);
      url.protocol = `${proto}:`;
      url.host = host;
      urls.add(url.toString());
    }
  }

  return Array.from(urls);
}

function hasValidTwilioSignature(request: NextRequest, params: URLSearchParams): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const signature = request.headers.get("x-twilio-signature");

  if (process.env.NODE_ENV !== "production" && (!authToken || !signature)) {
    console.warn("[SMS] Skipping Twilio signature validation outside production.");
    return true;
  }

  if (!authToken || !signature) {
    console.error("[SMS] Missing Twilio auth token or signature header.");
    return false;
  }

  const values = buildTwilioParams(params);
  return getTwilioCandidateUrls(request).some((url) => {
    try {
      return twilio.validateRequest(authToken, signature, url, values);
    } catch (error) {
      console.error("[SMS] Twilio signature validation error:", error);
      return false;
    }
  });
}

function twimlResponse(message: string): NextResponse {
  const response = new twilio.twiml.MessagingResponse();
  response.message(message);
  return new NextResponse(response.toString(), { headers: { "Content-Type": "text/xml" } });
}

/** Translate message if needed, then return TwiML response */
async function translatedTwimlResponse(message: string, lang: string): Promise<NextResponse> {
  const translated = lang !== "en" ? await translateText(message, lang) : message;
  return twimlResponse(translated);
}

function shouldAutoDetectLanguage(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (/^join(\s|$)/i.test(trimmed)) return false;
  if (/^(y|yes|n|no|help|done|next|skip)$/i.test(trimmed)) return false;
  if (trimmed.length < 12) return false;
  if (trimmed.split(/\s+/).length < 2) return false;
  return /[a-zA-Z]/.test(trimmed);
}

function truncateForSms(message: string, max = 480): string {
  const trimmed = (message || "").trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function pickTargetWorkOrderForStatusUpdate(
  workOrders: any[],
  workerId?: string | null,
  workerPhone?: string | null
) {
  if (!workOrders || workOrders.length === 0) return null;

  const score = (wo: any) => {
    let value = 0;
    if (wo.status === "in_progress") value += 100;
    if (wo.assigned_to && workerId && wo.assigned_to === workerId) value += 80;
    if (wo.status === "assigned") value += 40;
    if (wo.worker_phone && workerPhone && wo.worker_phone === workerPhone) value += 20;
    return value;
  };

  return [...workOrders].sort((a, b) => {
    const scoreDelta = score(b) - score(a);
    if (scoreDelta !== 0) return scoreDelta;
    return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
  })[0];
}

async function finalizeCompletedWorkOrder(workOrderId: string): Promise<void> {
  const results = await Promise.allSettled([
    handleWorkOrderCompletion(workOrderId),
    captureKnowledge(workOrderId),
  ]);

  if (results[0].status === "rejected") {
    console.error("[SMS] Work order completion follow-up failed:", results[0].reason);
  }
  if (results[1].status === "rejected") {
    console.error("[SMS] Knowledge capture error:", results[1].reason);
  }
}

async function findSimilarCompletedWorkOrders(companyId: string, issue: {
  assetId?: string | null;
  assetName?: string | null;
  category?: string | null;
}) {
  const lookbackIso = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString();

  let query = supabase
    .from("work_orders")
    .select("id, short_id, title, asset_id, asset_name, category, completed_at")
    .eq("company_id", companyId)
    .eq("status", "completed")
    .gte("completed_at", lookbackIso)
    .order("completed_at", { ascending: false })
    .limit(5);

  if (issue.assetId) {
    query = query.eq("asset_id", issue.assetId);
  } else if (issue.assetName) {
    query = query.ilike("asset_name", issue.assetName);
  } else if (issue.category) {
    query = query.eq("category", issue.category);
  } else {
    return [];
  }

  if (issue.category) {
    query = query.eq("category", issue.category);
  }

  const { data, error } = await query;
  if (error) {
    console.error("[SMS] Similar work order lookup failed:", error);
    return [];
  }

  return data || [];
}

async function findInventoryMatches(companyId: string, itemName: string) {
  const needle = itemName.toLowerCase().trim();
  if (!needle) return [];

  const { data, error } = await supabase
    .from("parts_inventory")
    .select("id, name, part_number, location, quantity_on_hand, reorder_point, supplier")
    .eq("company_id", companyId)
    .order("quantity_on_hand", { ascending: false })
    .limit(50);

  if (error || !data) {
    if (error) console.error("[SMS] Inventory lookup failed:", error);
    return [];
  }

  return data
    .map((item: any) => {
      const hay = `${item.name || ""} ${item.part_number || ""}`.toLowerCase();
      let score = 0;
      if (hay.includes(needle)) score += 6;
      if (needle.includes((item.part_number || "").toLowerCase())) score += 4;
      for (const token of needle.split(/\s+/).filter(Boolean)) {
        if (hay.includes(token)) score += 1;
      }
      return { ...item, score };
    })
    .filter((item: any) => item.score > 0)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 3);
}

function buildKnowledgeContextFromArticles(articles: any[]): string {
  if (!articles || articles.length === 0) return "";
  return articles
    .map((article: any) => {
      const title = article.title ? `[${article.title}] ` : "";
      const problem = article.problem ? `Problem: ${article.problem} ` : "";
      const solution = article.solution ? `Solution: ${article.solution}` : "";
      return `${title}${problem}${solution}`.trim();
    })
    .filter(Boolean)
    .join("\n");
}

function withTrainingCoachTail(message: string): string {
  const base = truncateForSms(message, 430);
  return truncateForSms(`${base}\n\nReply HELP if you're stuck or DONE when finished.`);
}

async function findRecentTrainingCoachQuestion(companyId: string, workerPhone: string) {
  const { data } = await supabase
    .from("questions")
    .select("id, question, answer, topic, created_at")
    .eq("company_id", companyId)
    .eq("worker_phone", workerPhone)
    .in("topic", [TRAINING_COACH_TOPIC, TRAINING_COACH_FOLLOW_UP_TOPIC])
    .order("created_at", { ascending: false })
    .limit(5);

  const recent = (data || []).find((row: any) => {
    const ageMs = Date.now() - new Date(row.created_at).getTime();
    return ageMs <= 2 * 60 * 60 * 1000;
  });

  return recent || null;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const rawBody = await request.text();
    const formData = new URLSearchParams(rawBody);

    if (!hasValidTwilioSignature(request, formData)) {
      return new NextResponse("Invalid Twilio signature", { status: 403 });
    }

    const body = formData.get("Body")?.toString()?.trim() || "";
    const rawFrom = formData.get("From")?.toString() || "";
    const incomingChannel: "sms" | "whatsapp" = isWhatsAppMessage(rawFrom) ? "whatsapp" : "sms";
    const from = normalizePhoneNumber(stripWhatsAppPrefix(rawFrom));

    // Rate limiting: max 60 SMS per minute per phone number
    if (!checkRateLimit(`sms:${from}`, 60, 60_000)) {
      return twimlResponse("Too many messages. Please wait a moment and try again.");
    }
    
    // NEW: Check for media attachments (images)
    const numMedia = parseInt(formData.get("NumMedia")?.toString() || "0", 10);
    const mediaUrl = formData.get("MediaUrl0")?.toString();
    const mediaType = formData.get("MediaContentType0")?.toString();
    
    console.log(`[${incomingChannel.toUpperCase()}] From:`, from, "Body:", body, "NumMedia:", numMedia);

    const { data: onboardingSession } = await supabase
      .from("onboarding_sessions")
      .select("step")
      .eq("phone", from)
      .single();

    if (body.toUpperCase() === "SETUP" || (onboardingSession && onboardingSession.step < 5)) {
      const result = await handleSmsOnboarding(from, body, mediaUrl);
      return twimlResponse(result.message);
    }

    // Check if this is a manager responding to a question
    const { data: pendingQuestion } = await supabase
      .from("questions")
      .select("*, companies(name)")
      .eq("pending_manager_response_phone", from)
      .is("manager_response", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    
    if (pendingQuestion) {
      if (body.toUpperCase() === "SKIP") {
        await supabase
          .from("questions")
          .update({ pending_manager_response_phone: null })
          .eq("id", pendingQuestion.id);
        
        return twimlResponse("Got it, skipped. The worker will figure it out another way.");
      }
      
      const managerAnswer = body;
      
      await supabase
        .from("questions")
        .update({ 
          manager_response: managerAnswer,
          pending_manager_response_phone: null,
          manager_notified: true
        })
        .eq("id", pendingQuestion.id);
      
      const companyName = (pendingQuestion.companies as any)?.name || "Your manager";
      await sendSMS(
        pendingQuestion.worker_phone,
        `REPLY: ${companyName} replied to your question:\n\n"${pendingQuestion.question}"\n\n️ ${managerAnswer}`
      );
      
      await saveToKnowledgeBase(
        pendingQuestion.company_id,
        pendingQuestion.question,
        managerAnswer
      );
      
      return twimlResponse(`Thanks! I've sent your answer to ${pendingQuestion.worker_name || "the worker"} and saved it for future questions. OK`);
    }

    // Check if worker exists
    const { data: worker } = await supabase
      .from("workers")
      .select("*")
      .eq("phone", from)
      .single();

    // Resolve response language. Use the worker's saved preference when available.
    // Avoid auto-detecting on short onboarding replies like names, roles, or JOIN codes.
    let detectedLang = worker?.preferred_language || "en";
    if (!worker?.preferred_language && shouldAutoDetectLanguage(body)) {
      detectedLang = await detectLanguage(body);
      console.log(`[${incomingChannel.toUpperCase()}] Detected language: ${detectedLang}`);
    }

    // CASE 0: Check if this is a Y/N response to escalation prompt
    if (worker && worker.pending_escalation_question_id) {
      const response = body.toUpperCase().trim();
      
      if (response === "Y" || response === "YES") {
        const { data: question } = await supabase
          .from("questions")
          .select("id, question, company_id")
          .eq("id", worker.pending_escalation_question_id)
          .single();
        
        if (question) {
          const { data: company } = await supabase
            .from("companies")
            .select("name, manager_phone, manager_name")
            .eq("id", question.company_id)
            .single();
          
          if (company?.manager_phone) {
            await supabase
              .from("questions")
              .update({ 
                manager_notified: true,
                pending_manager_response_phone: company.manager_phone
              })
              .eq("id", question.id);
            
            await sendSMS(
              company.manager_phone,
              `NOTE Sidekick Alert for ${company.name}\n\n${worker.name || "A worker"} asked:\n"${question.question}"\n\nREPLY: Reply with your answer and I'll send it to them & remember it for next time.\n\nOr reply SKIP to ignore.`
            );
          }
          
          await supabase
            .from("workers")
            .update({ pending_escalation_question_id: null })
            .eq("phone", from);
          
          return twimlResponse(`Got it! I've asked ${company?.manager_name || "your manager"}. They can reply directly and I'll forward their answer to you. OK`);
        }
      } else if (response === "N" || response === "NO") {
        await supabase
          .from("workers")
          .update({ pending_escalation_question_id: null })
          .eq("phone", from);
        
        return twimlResponse("No problem! Let me know if you have other questions. OK");
      }
      
      await supabase
        .from("workers")
        .update({ pending_escalation_question_id: null })
        .eq("phone", from);
    }

    // CASE 1: New user trying to join with access code
    // Accept: "JOIN CODE" (preferred) and be tolerant of extra whitespace/newlines.
    // Reject: "JOIN" without a code.
    if (!worker) {
      const normalized = body.replace(/\s+/g, " ").trim().toUpperCase();
      
      if (normalized === "JOIN") {
        return await translatedTwimlResponse("Please text JOIN followed by your company's code. Example: JOIN ABC123", detectedLang);
      }
      
      if (normalized.startsWith("JOIN ")) {
        const accessCode = normalized.slice(5).trim();
        
        // Safety: ensure we didn't accidentally parse an empty code
        if (!accessCode) {
          return await translatedTwimlResponse("Please text JOIN followed by your company's code. Example: JOIN ABC123", detectedLang);
        }
        
        const { data: company } = await supabase
          .from("companies")
          .select("id, name, access_code")
          .eq("access_code", accessCode)
          .single();

        if (!company) {
          const companyName = normalized.slice(5).trim();
          const companyId = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

          const { data: legacyCompany } = await supabase
            .from("companies")
            .select("id, name")
            .eq("id", companyId)
            .single();

          if (!legacyCompany) {
            return await translatedTwimlResponse("Sorry, that access code wasn't recognized. Please check with your manager for the correct code.", detectedLang);
          }

          await supabase.from("workers").insert({
            phone: from,
            company_id: legacyCompany.id,
            name: null,
            verified: false,
          });

          // Store detected language on the new worker
          if (detectedLang !== "en") {
            await supabase.from("workers").update({ preferred_language: detectedLang }).eq("phone", from);
          }
          return await translatedTwimlResponse(`Welcome to ${legacyCompany.name}! What's your first name?`, detectedLang);
        }

        await supabase.from("workers").insert({
          phone: from,
          company_id: company.id,
          name: null,
          verified: false,
        });

        // Store detected language on the new worker
        if (detectedLang !== "en") {
          await supabase.from("workers").update({ preferred_language: detectedLang }).eq("phone", from);
        }
        return await translatedTwimlResponse(`Welcome to ${company.name}! What's your first name?`, detectedLang);
      }
    }

    // CASE 2: New user without JOIN command
    if (!worker) {
      return await translatedTwimlResponse("Welcome to Sidekick! Text JOIN followed by your company's 6-letter code to get started.\n\nExample: JOIN ABC123", detectedLang);
    }

    // CASE 3: Worker exists but hasn't provided name yet
    if (worker && !worker.name) {
      const name = body.trim().split(" ")[0];
      
      if (name.length < 2 || name.length > 30) {
        return await translatedTwimlResponse("Please reply with your first name to get started.", detectedLang);
      }
      
      await supabase
        .from("workers")
        .update({ name: name, verified: true, pending_profile_step: 'role' })
        .eq("phone", from);

      // Ask for role next
      const { data: companyForRole } = await supabase
        .from("companies")
        .select("name")
        .eq("id", worker.company_id)
        .single();
      return await translatedTwimlResponse(`Thanks ${name}! 👋 Welcome to ${companyForRole?.name || "Sidekick"}!\n\nWhat's your role? (e.g. Mechanic, Electrician, Operator, Supervisor)`, detectedLang);
    }

    // CASE 3b: Worker has name but pending role collection
    if (worker && worker.name && worker.pending_profile_step === 'role' && body.trim().length >= 2 && body.trim().length <= 50) {
      const roleInput = body.trim().toLowerCase();
      const roleMap: Record<string, string> = {
        mechanic: "technician", tech: "technician", technician: "technician",
        supervisor: "supervisor", manager: "manager", operator: "operator", electrician: "technician"
      };
      const mappedRole = roleMap[roleInput] || "operator";
      await supabase.from("workers").update({ role: mappedRole, pending_profile_step: null }).eq("phone", from);
      return await translatedTwimlResponse(`Got it — ${body.trim()}! You're all set. 🔧\n\nText me any maintenance issue, question, or "HELP" to see what I can do!`, detectedLang);
    }

    // CASE 4: Registered worker - get company info
    const { data: company } = await supabase
      .from("companies")
      .select("name, manager_phone, manager_name, industry, worker_count, metadata")
      .eq("id", worker.company_id)
      .single();

    const companyRuntimeSettings = await getCompanyRuntimeSettings(worker.company_id);
    const criticalSmsEnabled = companyRuntimeSettings.notification_preferences.sms_on_critical;

    if (shouldTreatAsManagerUpdate(body, company, from)) {
      try {
        const applied = await applyManagerSmsUpdate({
          companyId: worker.company_id,
          company,
          message: body,
        });

        await auditLog({
          companyId: worker.company_id,
          action: "manager.sms_update",
          entityType: "company",
          entityId: worker.company_id,
          details: applied,
        });

        return twimlResponse(
          truncateForSms(
            `${applied.summary}${applied.assetsChanged ? ` Added/updated ${applied.assetsChanged} asset${applied.assetsChanged === 1 ? "" : "s"}.` : ""}${applied.teamChanged ? ` Synced ${applied.teamChanged} team member${applied.teamChanged === 1 ? "" : "s"}.` : ""}${applied.knowledgeAdded ? ` Saved ${applied.knowledgeAdded} knowledge entr${applied.knowledgeAdded === 1 ? "y" : "ies"}.` : ""}`
          )
        );
      } catch (error) {
        console.error("[SMS] Manager update failed:", error);
        return twimlResponse("Sorry, I couldn't apply that manager update right now. Try again with UPDATE: and a little more detail.");
      }
    }

    // ============================================
    // TRIAL LIMIT CHECK
    // ============================================
    if (worker.company_id) {
      const { data: managerAccount } = await supabase
        .from("manager_accounts")
        .select("plan, trial_ends_at, questions_used, questions_limit")
        .eq("company_id", worker.company_id)
        .single();

      if (managerAccount && managerAccount.plan === "trial") {
        const trialExpired = new Date(managerAccount.trial_ends_at) < new Date();
        const questionsExhausted = managerAccount.questions_used >= managerAccount.questions_limit;

        if (trialExpired || questionsExhausted) {
          return twimlResponse("⏳ Your company\'s free trial has ended. Ask your manager to upgrade at textsidekick.com to continue using Sidekick!");
        }

        // Increment questions_used
        await supabase
          .from("manager_accounts")
          .update({ questions_used: managerAccount.questions_used + 1 })
          .eq("company_id", worker.company_id);
      }
    }

    // ============================================
    // CHECKLIST: Start checklist
    // ============================================
    if (body.toUpperCase() === "CHECKLIST" || body.toUpperCase() === "CHECK" || body.toUpperCase() === "SAFETY") {
      // Mark worker as having pending checklist
      await supabase
        .from("workers")
        .update({ pending_checklist: true })
        .eq("phone", from);
      
      return twimlResponse(` Shift Safety Check\n\n1. PPE on? (Y/N)\n2. LOTO performed? (Y/N)\n3. Equipment inspected? (Y/N)\n\nReply like: Y Y Y`);
    }

    // ============================================
    // CHECKLIST: Process checklist response
    // ============================================
    if (worker.pending_checklist) {
      const results = parseChecklistResponse(body);
      
      // Check if this looks like a valid checklist response
      const validResponse = results.ppe !== null || results.loto !== null || results.equipment !== null;
      
      if (validResponse) {
        // Clear pending checklist
        await supabase
          .from("workers")
          .update({ pending_checklist: false })
          .eq("phone", from);
        
        // Log the checklist
        await supabase.from("checklists").insert({
          company_id: worker.company_id,
          worker_phone: from,
          worker_name: worker.name,
          ppe_ok: results.ppe,
          loto_ok: results.loto,
          equipment_ok: results.equipment,
          shift_date: new Date().toISOString().split('T')[0],
        });
        
        const { message, hasFailures, failures } = formatChecklistResult(results);
        
        // Notify manager if there are failures
        if (hasFailures && company?.manager_phone) {
          await sendSMS(
            company.manager_phone,
            `️ Safety Checklist Alert\n\nWorker: ${worker.name}\nIssues: ${failures.join(", ")}\n\nPlease follow up.`
          );
        }
        
        let response = message;
        if (hasFailures) {
          response += `\n\n️ ${company?.manager_name || "Manager"} has been notified. Please address issues before starting work.`;
        } else {
          response += `\n\nOK All clear! Have a safe shift.`;
        }
        
        return twimlResponse(response);
      }
      // If not a valid checklist response, clear the flag and process normally
      await supabase
        .from("workers")
        .update({ pending_checklist: false })
        .eq("phone", from);
    }

    // ============================================
    // CERTIFICATIONS: View my certs
    // ============================================
    if (body.toUpperCase() === "MY CERTS" || body.toUpperCase() === "CERTS" || body.toUpperCase() === "CERTIFICATIONS") {
      const { data: certs } = await supabase
        .from("certifications")
        .select("*")
        .eq("worker_phone", from)
        .order("expiry_date", { ascending: true });

      if (!certs || certs.length === 0) {
        return twimlResponse("NOTE You don't have any certifications on file yet.\n\nAsk your manager to add your certifications to Sidekick.");
      }

      const today = new Date();
      let response = "NOTE Your Certifications:\n\n";
      
      certs.forEach(cert => {
        const expiry = new Date(cert.expiry_date);
        const daysUntil = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        let status = "OK";
        if (daysUntil < 0) status = "NOT OK EXPIRED";
        else if (daysUntil <= 30) status = "️ Expiring soon";
        
        response += `${status} ${cert.cert_name}\n`;
        if (daysUntil < 0) {
          response += `   Expired ${Math.abs(daysUntil)} days ago\n`;
        } else if (daysUntil <= 30) {
          response += `   Expires in ${daysUntil} days\n`;
        } else {
          response += `   Expires: ${expiry.toLocaleDateString()}\n`;
        }
        response += "\n";
      });

      const expiringSoon = certs.filter(c => {
        const daysUntil = Math.ceil((new Date(c.expiry_date).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntil >= 0 && daysUntil <= 30;
      });

      if (expiringSoon.length > 0) {
        response += `️ ${expiringSoon.length} cert(s) need renewal soon. Contact your manager.`;
      }

      return twimlResponse(response);
    }

    // ============================================
    // ============================================
    // NEW: Handle audio messages
    // ============================================
    const isAudio = mediaType?.startsWith("audio/") || mediaType?.includes("amr") || mediaType?.includes("ogg");
    if (numMedia > 0 && mediaUrl && isAudio) {
      console.log("[SMS] Processing audio from", worker.name, "MediaType:", mediaType);
      
      try {
        // Fetch the audio file from Twilio
        const response = await fetch(mediaUrl, {
          headers: {
            Authorization: `Basic ${Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")}`,
          },
        });
        
        if (!response.ok) {
          console.error("[SMS] Failed to fetch audio:", response.status, response.statusText);
          return twimlResponse("Sorry, I couldn't load that audio. Please try again.");
        }
        
        const audioBuffer = await response.arrayBuffer();
        console.log("[SMS] Audio buffer size:", audioBuffer.byteLength);
        
        console.log("[SMS] Transcribing audio, mediaType:", mediaType, "provider:", process.env.DEEPGRAM_API_KEY ? "deepgram" : "openai");

        const transcribedText = await transcribeAudio(Buffer.from(audioBuffer), mediaType);
        console.log("[SMS] Transcribed audio:", transcribedText);
        
        if (!transcribedText || transcribedText.trim().length === 0) {
          return twimlResponse("I couldn't understand the audio. Could you try speaking more clearly or send a text message?");
        }
        
        // Now process the transcribed text as a regular question
        // Search for relevant documents
        const relevantChunks = await searchDocuments(transcribedText, worker.company_id);
        const bestSimilarity = relevantChunks.length > 0 
          ? Math.round(Math.max(...relevantChunks.map((c: any) => c.similarity)) * 100)
          : 0;
        
        // Build context and generate answer
        const context = relevantChunks.map((c: any) => c.content).join("\n\n");
        const systemPrompt = `You are Sidekick, the AI assistant for ${company?.name || "this company"}. You're texting with ${worker.name || "a team member"}.

YOUR JOB: Answer workplace questions quickly and accurately using the company's own documents and knowledge base. You're like a coworker who has read every document, policy, and SOP.

HOW TO RESPOND:
- Be direct and conversational — this is a text message, not an email
- Use the company's actual docs when available (cite them: "Per your Employee Handbook:")
- If docs don't cover it, give your best helpful answer based on general industry knowledge
- Keep it under 400 characters (it's SMS) but be complete
- Use emoji sparingly to keep it friendly OK
- If it's a safety question, always err on the side of caution
- Never say "I'm an AI" — you're Sidekick
- If the worker texts in ANY language other than English, respond in THEIR language. Auto-detect and match. Spanish, Chinese, Vietnamese, Tagalog, Korean, etc, part of their team

IF YOU DON'T KNOW:
- Don't say "I don't have information" — instead say something like "I couldn't find that in your docs. Want me to ask ${company?.manager_name || "your manager"}?"
- Always offer to escalate to the manager as a helpful next step`;
        
        const userMessage = context
          ? `Context from company documents:\n${context}\n\nQuestion: ${transcribedText}`
          : `Question: ${transcribedText}\n\nNote: No relevant documents found. Provide a helpful general response.`;
        
        const answer = await getAIResponse(systemPrompt, userMessage);
        
        const responseTime = Date.now() - startTime;
        const lowConfidence = isLowConfidenceAnswer(answer) || bestSimilarity < 40;
        
        // Log the question
        const { data: questionRecord } = await insertQuestionRecord({
          company_id: worker.company_id,
          worker_phone: from,
          worker_name: worker.name,
          question: `[VOICE] ${transcribedText}`,
          answer: answer,
          confidence: bestSimilarity,
          response_time_ms: responseTime,
          manager_notified: false,
          language: detectedLang,
          channel: incomingChannel,
        });
        
        // Handle low confidence with escalation option
        if (lowConfidence && company?.manager_phone && questionRecord) {
          await supabase
            .from("workers")
            .update({ pending_escalation_question_id: questionRecord.id })
            .eq("phone", from);
          
          return twimlResponse(`Voice: I heard: "${transcribedText}"\n\n${answer}\n\n---\nWant me to notify ${company.manager_name || "your manager"} about this question?\n\nReply Y for Yes, N for No`);
        }
        
        return twimlResponse(`Voice: I heard: "${transcribedText}"\n\n${answer}`);
      } catch (error: any) {
        console.error("[SMS] Audio processing error:", error?.message || error);
        console.error("[SMS] Audio error stack:", error?.stack);
        console.error("[SMS] Audio mediaType was:", mediaType);
        return twimlResponse("Sorry, I couldn't process that audio just now. Please try again or send it as text.");
      }
    }

    // NEW: Handle image messages
    // ============================================
    let imageAnalysisForTriage: any | undefined;
    if (numMedia > 0 && mediaUrl && mediaType?.startsWith("image/")) {
      console.log("[SMS] Processing image from", worker.name, "MediaType:", mediaType);

      // Fetch and analyze the image
      const imageData = await fetchImageAsBase64(mediaUrl);

      if (!imageData) {
        return twimlResponse("Sorry, I couldn't load that image. Please try sending it again.");
      }

      // Analyze the image with Claude Vision
      const imageAnalysis = await analyzeImage(imageData.base64, imageData.mediaType, body || undefined);

      console.log("[SMS] Image analysis:", JSON.stringify(imageAnalysis, null, 2));

      // Search documents using the generated queries
      let allRelevantChunks: any[] = [];
      for (const query of imageAnalysis.searchQueries) {
        const chunks = await searchDocuments(query, worker.company_id);
        allRelevantChunks = [...allRelevantChunks, ...chunks];
      }

      // Also search with any identified items
      for (const item of imageAnalysis.identifiedItems) {
        const chunks = await searchDocuments(item, worker.company_id);
        allRelevantChunks = [...allRelevantChunks, ...chunks];
      }

      // Deduplicate chunks by content
      const uniqueChunks = allRelevantChunks
        .filter((chunk, index, self) => index === self.findIndex((c) => c.content === chunk.content))
        .slice(0, 5); // Keep top 5

      const bestSimilarity = uniqueChunks.length > 0 ? Math.round(Math.max(...uniqueChunks.map((c) => c.similarity)) * 100) : 0;

      // Generate response
      const answer = await generateImageResponse(
        imageAnalysis,
        uniqueChunks,
        worker.name || "Worker",
        company?.name || "your company",
        body || undefined
      );

      const responseTime = Date.now() - startTime;
      const lowConfidence = isLowConfidenceAnswer(answer) || bestSimilarity < 40;

      // Log the question (include image info)
      const questionText = body ? `[IMAGE] ${body}` : `[IMAGE] ${imageAnalysis.description}`;

      const { data: questionRecord } = await supabase
        .from("questions")
        .insert({
          company_id: worker.company_id,
          worker_phone: from,
          worker_name: worker.name,
          question: questionText,
          answer: answer,
          confidence: bestSimilarity,
          response_time_ms: responseTime,
          manager_notified: false,
          // You could add: image_url: mediaUrl (if you want to store it)
        })
        .select()
        .single();

      // For safety-related images with low confidence, always offer escalation
      if ((imageAnalysis.isSafetyRelated || lowConfidence) && company?.manager_phone && questionRecord) {
        await supabase.from("workers").update({ pending_escalation_question_id: questionRecord.id }).eq("phone", from);

        const safetyPrefix = imageAnalysis.isSafetyRelated ? "️ SAFETY: " : "";
        return twimlResponse(`${safetyPrefix}${answer}\n\n---\nWant me to ask ${company.manager_name || "your manager"} about this?\n\nReply Y/N`);
      }

      // NOTE: We now fall through to AI triage for ALL messages, including images.
      // We still return the helpful image-based answer immediately if it seems like a pure ID/help question.
      // For image-based issue reports, triage below will create a work order.
      // We'll only short-circuit here if the image answer is high confidence and NOT safety related.
      if (!imageAnalysis.isSafetyRelated && !lowConfidence) {
        return twimlResponse(answer);
      }

      // else: continue and include imageAnalysis in triage context
      // (do not return)

      // attach to request-scoped variable
      imageAnalysisForTriage = imageAnalysis;
    }
    // ============================================
    // END: Handle image messages
    // ============================================

    // ============================================
    // FRONTLINE TRAINING COACH
    // ============================================
    const trainingFollowUpKind = getTrainingCoachFollowUpKind(body);
    if (trainingFollowUpKind) {
      const recentCoachQuestion = await findRecentTrainingCoachQuestion(worker.company_id, from);

      if (recentCoachQuestion) {
        if (trainingFollowUpKind === "done") {
          const doneMessage = detectedLang === "en"
            ? "Nice work — I’ve marked that coaching flow complete. Text me if you want another procedure or run into a problem."
            : await translateText("Nice work — I’ve marked that coaching flow complete. Text me if you want another procedure or run into a problem.", detectedLang);

          await insertQuestionRecord({
            company_id: worker.company_id,
            worker_phone: from,
            worker_name: worker.name,
            question: `[COACH DONE] ${recentCoachQuestion.question}`,
            answer: doneMessage,
            confidence: 100,
            response_time_ms: Date.now() - startTime,
            manager_notified: false,
            language: detectedLang,
            channel: incomingChannel,
            topic: TRAINING_COACH_FOLLOW_UP_TOPIC,
          });

          return twimlResponse(doneMessage);
        }

        let followUpKnowledge: any[] = [];
        try {
          const { searchKnowledge } = require("@/lib/knowledge-engine");
          followUpKnowledge = await searchKnowledge(`${recentCoachQuestion.question} ${body}`, worker.company_id, 4);
        } catch { /* knowledge engine not critical */ }

        const followUpChunks = await searchDocuments(`${recentCoachQuestion.question} ${body}`, worker.company_id);
        const knowledgeContext = buildKnowledgeContextFromArticles(followUpKnowledge);
        const docsContext = followUpChunks.map((chunk: any) => chunk.content).join("\n\n");
        const isSafetyQuestion = containsSafetyTopic(recentCoachQuestion.question) || containsSafetyTopic(body);

        const followUpPrompt = `You are Sidekick, coaching a frontline worker over text.

Task they originally asked about: ${recentCoachQuestion.question}
Your last coaching reply: ${recentCoachQuestion.answer}
The worker just replied: ${body}

Rules:
- Give the next most helpful coaching response for this exact task.
- Keep it under 420 characters.
- Use direct step-by-step language.
- ${trainingFollowUpKind === "help" ? "Help them get unstuck on the task." : "Continue the coaching flow with the next useful step."}
- ${isSafetyQuestion ? "Lead with safety and PPE/LOTO reminders if relevant." : "Mention safety only if it matters to the task."}
- Respond entirely in ${detectedLang === "en" ? "English" : detectedLang}.
- End naturally; do not mention being an AI.`;

        const followUpAnswer = withTrainingCoachTail(await getAIResponse(
          followUpPrompt,
          docsContext || knowledgeContext
            ? `COMPANY KNOWLEDGE:\n${knowledgeContext}\n\nCOMPANY DOCS:\n${docsContext}\n\nWorker follow-up: ${body}`
            : `Worker follow-up: ${body}\n\nNo company context was found. Give practical general guidance and offer to ask the manager if uncertain.`
        ));

        const followUpSimilarity = followUpChunks.length > 0
          ? Math.round(Math.max(...followUpChunks.map((chunk: any) => Number(chunk.similarity) || 0)) * 100)
          : (followUpKnowledge.length > 0 ? 70 : 25);
        const followUpLowConfidence = isLowConfidenceAnswer(followUpAnswer) || followUpSimilarity < 45;

        const { data: followUpRecord } = await insertQuestionRecord({
          company_id: worker.company_id,
          worker_phone: from,
          worker_name: worker.name,
          question: `[COACH FOLLOW-UP] ${body}`,
          answer: followUpAnswer,
          confidence: followUpSimilarity,
          response_time_ms: Date.now() - startTime,
          manager_notified: false,
          language: detectedLang,
          channel: incomingChannel,
          topic: TRAINING_COACH_FOLLOW_UP_TOPIC,
        });

        if (followUpLowConfidence && company?.manager_phone && followUpRecord) {
          await supabase
            .from("workers")
            .update({ pending_escalation_question_id: followUpRecord.id })
            .eq("phone", from);

          return twimlResponse(`${followUpAnswer}\n\n---\nWant me to notify ${company.manager_name || "your manager"} about this?\n\nReply Y for Yes, N for No`);
        }

        return twimlResponse(followUpAnswer);
      }
    }

    const isTrainingRequest = isTrainingCoachRequest(body);
    if (isTrainingRequest) {
      let knowledgeResults: any[] = [];
      try {
        const { searchKnowledge } = require("@/lib/knowledge-engine");
        knowledgeResults = await searchKnowledge(body, worker.company_id, 5);
      } catch { /* knowledge engine not critical */ }

      const relevantChunks = await searchDocuments(body, worker.company_id);
      const knowledgeContext = buildKnowledgeContextFromArticles(knowledgeResults);
      const docsContext = relevantChunks.map((chunk: any) => chunk.content).join("\n\n");
      const isSafetyQuestion = containsSafetyTopic(body);
      const imageContext = imageAnalysisForTriage
        ? `\n\nIMAGE CONTEXT:\n${JSON.stringify(imageAnalysisForTriage)}`
        : "";

      const coachingPrompt = `You are Sidekick, a frontline training coach texting with ${worker.name || "a team member"} at ${company?.name || "their company"}.

Goal: coach them through a task or procedure by text.

Rules:
- Keep the reply under 420 characters.
- Give 3-5 concrete steps max.
- Use the company's SOPs, fixes, and documents when available.
- ${isSafetyQuestion ? "Lead with safety, PPE, and LOTO warnings before steps." : "Mention safety only if the task needs it."}
- If the docs are weak, still give the best practical answer you can and offer to ask ${company?.manager_name || "their manager"}.
- Respond entirely in ${detectedLang === "en" ? "English" : detectedLang}.
- End with a natural coaching tone; do not mention being an AI.`;

      const coachingAnswer = withTrainingCoachTail(await getAIResponse(
        coachingPrompt,
        docsContext || knowledgeContext
          ? `COMPANY KNOWLEDGE:\n${knowledgeContext}\n\nCOMPANY DOCS:\n${docsContext}${imageContext}\n\nWorker request: ${body}`
          : `Worker request: ${body}${imageContext}\n\nNo company documents were found. Give practical general guidance and offer manager escalation if uncertain.`
      ));

      const coachingSimilarity = relevantChunks.length > 0
        ? Math.round(Math.max(...relevantChunks.map((chunk: any) => Number(chunk.similarity) || 0)) * 100)
        : (knowledgeResults.length > 0 ? 70 : 25);
      const coachingLowConfidence = isLowConfidenceAnswer(coachingAnswer) || coachingSimilarity < 45;

      const { data: coachingRecord } = await insertQuestionRecord({
        company_id: worker.company_id,
        worker_phone: from,
        worker_name: worker.name,
        question: `[COACH] ${body}`,
        answer: coachingAnswer,
        confidence: coachingSimilarity,
        response_time_ms: Date.now() - startTime,
        manager_notified: false,
        language: detectedLang,
        channel: incomingChannel,
        topic: TRAINING_COACH_TOPIC,
      });

      if (coachingLowConfidence && company?.manager_phone && coachingRecord) {
        await supabase
          .from("workers")
          .update({ pending_escalation_question_id: coachingRecord.id })
          .eq("phone", from);

        return twimlResponse(`${coachingAnswer}\n\n---\nWant me to notify ${company.manager_name || "your manager"} about this?\n\nReply Y for Yes, N for No`);
      }

      return twimlResponse(coachingAnswer);
    }

    // ============================================
    // AI TRIAGE (replaces regex issue detection)
    // ============================================
    const activeWorkOrdersPromise = (async () => {
      const baseQuery = supabase
        .from("work_orders")
        .select("id, short_id, title, status, assigned_to, worker_phone, asset_name, ai_triage, created_at")
        .eq("company_id", worker.company_id)
        .in("status", ["open", "assigned", "in_progress", "on_hold"])
        .order("created_at", { ascending: false })
        .limit(20);

      const [{ data: reportedWorkOrders }, assignedResult] = await Promise.all([
        baseQuery.eq("worker_phone", from),
        worker.id
          ? supabase
              .from("work_orders")
              .select("id, short_id, title, status, assigned_to, worker_phone, asset_name, ai_triage, created_at")
              .eq("company_id", worker.company_id)
              .eq("assigned_to", worker.id)
              .in("status", ["open", "assigned", "in_progress", "on_hold"])
              .order("created_at", { ascending: false })
              .limit(20)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const merged = [...(reportedWorkOrders || []), ...((assignedResult as any)?.data || [])];
      const deduped = Array.from(new Map(merged.map((wo: any) => [wo.id, wo])).values());

      return deduped
        .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
        .slice(0, 20);
    })();

    const [
      { data: assets },
      activeWorkOrders,
      { data: categoryRows },
      { data: priorityRows },
    ] = await Promise.all([
      supabase
        .from("assets")
        .select("id, name, asset_tag")
        .eq("company_id", worker.company_id)
        .limit(200),
      activeWorkOrdersPromise,
      supabase
        .from("wo_categories")
        .select("name, color")
        .eq("company_id", worker.company_id)
        .order("name"),
      supabase
        .from("wo_priorities")
        .select("id, name, level, sla_hours")
        .eq("company_id", worker.company_id)
        .order("level", { ascending: false }),
    ]);

    const companyCategories = (categoryRows || []).map((row: any) => ({
      name: row.name,
      color: row.color,
    }));
    const priorityProfiles = normalizeCompanyPriorityProfiles(
      priorityRows as any,
      companyRuntimeSettings.priority_display_labels
    );

    // ============================================
    // DIRECT WO STATUS COMMANDS (bypass AI triage)
    // Handle START and COMPLETE directly to avoid AI classification errors
    // ============================================
    const upperBodyTrim = body.toUpperCase().trim();
    const isDirectStart = upperBodyTrim === "START" || upperBodyTrim === "STARTED" || upperBodyTrim === "ON IT";
    const isDirectComplete = upperBodyTrim === "COMPLETE" || upperBodyTrim === "DONE" || upperBodyTrim === "FIXED"
      || upperBodyTrim === "COMPLETED" || upperBodyTrim === "FINISHED";

    if ((isDirectStart || isDirectComplete) && activeWorkOrders && activeWorkOrders.length > 0) {
      // Clear any stale pending_asset_id
      if ((worker as any).pending_asset_id) {
        await supabase.from("workers").update({ pending_asset_id: null } as any).eq("phone", from);
      }
      const targetWo = pickTargetWorkOrderForStatusUpdate(activeWorkOrders, worker.id, from);
      if (!targetWo) {
        return twimlResponse("I couldn't find the right open work order. Reply with the WO number if you have it.");
      }
      if (isDirectStart) {
        const { error } = await supabase.from("work_orders")
          .update({ status: "in_progress", started_at: new Date().toISOString() })
          .eq("id", targetWo.id);
        if (error) {
          console.error("[SMS] Direct START update error:", error);
          return twimlResponse("Sorry, couldn't update the work order. Please try again.");
        }

        const criticalIncidentMeta = getCriticalIncidentMeta((targetWo as any).ai_triage || null);
        if (criticalIncidentMeta && criticalSmsEnabled && company?.manager_phone) {
          await sendSMS(
            company.manager_phone,
            truncateForSms(`CRITICAL UPDATE ${targetWo.short_id || targetWo.id.slice(0, 8)}\n${worker.name || "Assigned tech"} started on ${targetWo.asset_name || targetWo.title || "the incident"}.`)
          );
        }

        return twimlResponse("OK Work order started. Good luck out there!");
      } else {
        const { error } = await supabase.from("work_orders")
          .update({ status: "completed", completed_at: new Date().toISOString() })
          .eq("id", targetWo.id);
        if (error) {
          console.error("[SMS] Direct COMPLETE update error:", error);
          return twimlResponse("Sorry, couldn't update the work order. Please try again.");
        }

        await finalizeCompletedWorkOrder(targetWo.id);

        const criticalIncidentMeta = getCriticalIncidentMeta((targetWo as any).ai_triage || null);
        if (criticalIncidentMeta && criticalSmsEnabled && company?.manager_phone) {
          await sendSMS(
            company.manager_phone,
            truncateForSms(`CRITICAL RESOLVED ${targetWo.short_id || targetWo.id.slice(0, 8)}\n${worker.name || "Assigned tech"} marked ${targetWo.asset_name || targetWo.title || "the incident"} complete.`)
          );
        }

        return twimlResponse("OK Work order marked complete. Nice work!");
      }
    }
    // ============================================
    // END: DIRECT WO STATUS COMMANDS
    // ============================================

    const triage = await triageIncomingMessage({
      message: body,
      workerPhone: from,
      companyId: worker.company_id,
      imageAnalysis: imageAnalysisForTriage,
      existingAssets: (assets || []) as any,
      activeWorkOrders: (activeWorkOrders || []) as any,
      companyCategories: companyCategories as any,
      priorityProfiles,
    });

    // ============================================
    // ASSET LEARNING: auto-create draft assets
    // ============================================
    if (triage.issue?.assetName && !triage.issue?.assetId) {
      // Check if this asset name already exists (fuzzy match)
      const mentionedName = triage.issue.assetName.toLowerCase().trim();
      const existingMatch = (assets || []).find((a: any) =>
        (a.name || "").toLowerCase().includes(mentionedName) ||
        mentionedName.includes((a.name || "").toLowerCase())
      );

      if (!existingMatch && mentionedName.length > 2) {
        try {
          // Auto-create draft asset
          const { data: newAsset } = await supabase
            .from("assets")
            .insert({
              company_id: worker.company_id,
              name: triage.issue.assetName,
              asset_tag: `AUTO-${Date.now().toString().slice(-6)}`,
              type: "equipment",
              location: "Unassigned",
              status: "operational",
              metadata: {
                learned_via: "sms",
                draft: true,
              },
            } as any)
            .select()
            .single();

          if (newAsset) {
            // Store pending asset question on the worker
            await supabase
              .from("workers")
              .update({ pending_asset_id: (newAsset as any).id } as any)
              .eq("phone", from);

            // Send follow-up SMS AFTER the main response (non-blocking)
            const followUpMsg =
              `I noticed you mentioned "${triage.issue.assetName}". Is that a piece of equipment here? ` +
              `Reply with its type and location (e.g. "CNC lathe, Building A") or SKIP to ignore.`;
            // Send asynchronously so it doesn't delay the main response
            sendSMS(from, followUpMsg).catch((e: any) =>
              console.error("[SMS] Asset learning follow-up failed:", e)
            );
            console.log("[SMS] Created draft asset:", triage.issue.assetName);
          }
        } catch (e) {
          console.error("[SMS] Asset learning error:", e);
        }
      }
    }

    // Handle pending asset confirmation response
    // Skip asset confirmation if this is a work order update (e.g. worker texting START/COMPLETE)
    if ((worker as any).pending_asset_id && triage.messageType !== "work_order_update") {
      const upperBody = body.toUpperCase().trim();
      if (upperBody === "SKIP") {
        await supabase.from("workers").update({ pending_asset_id: null } as any).eq("phone", from);
        return twimlResponse("Got it, skipped.");
      }
      // Check if this looks like an asset description (not a maintenance issue)
      if (body.length < 120 && !body.match(/(broken|not working|leak|noise|fail|error|down|problem)/i)) {
        // Parse type and location from response
        const parts = body.split(",").map((p: string) => p.trim());
        const assetType = parts[0] || null;
        const assetLocation = parts[1] || null;
        await supabase
          .from("assets")
          .update({
            type: assetType || "equipment",
            location: assetLocation || "Unassigned",
            status: "operational",
            metadata: {
              learned_via: "sms",
              draft: false,
            },
          } as any)
          .eq("id", (worker as any).pending_asset_id);
        await supabase.from("workers").update({ pending_asset_id: null } as any).eq("phone", from);
        return twimlResponse(`Thanks! I've added "${assetType || "the asset"}"${assetLocation ? ` at ${assetLocation}` : ""} to the equipment list.`);
      }
      // Clear the pending asset question and fall through to process the message normally
      await supabase.from("workers").update({ pending_asset_id: null } as any).eq("phone", from);
    }

    // Branch based on messageType
    if (triage.messageType === "supply_request") {
      try {
        const itemName = triage.supplyRequest?.itemName || body.slice(0, 80);
        const requestedQty = triage.supplyRequest?.quantity || 1;
        const urgency = triage.supplyRequest?.urgency || "medium";
        const inventoryMatches = await findInventoryMatches(worker.company_id, itemName);
        const bestMatch = inventoryMatches[0] || null;

        const stockLine = bestMatch
          ? `Stock: ${bestMatch.quantity_on_hand} on hand${bestMatch.location ? ` at ${bestMatch.location}` : ""}`
          : "Stock: no clear inventory match";

        const woTitle = `Supply request: ${itemName}`.slice(0, 120);
        const { data: supplyWo, error: supplyErr } = await supabase
          .from("work_orders")
          .insert({
            company_id: worker.company_id,
            asset_id: null,
            asset_name: null,
            asset_tag: null,
            category: "other",
            priority: urgency,
            title: woTitle,
            description: [
              `Supply request from ${worker.name || from}`,
              `Requested item: ${itemName}`,
              `Requested quantity: ${requestedQty}`,
              triage.supplyRequest?.neededFor ? `Needed for: ${triage.supplyRequest.neededFor}` : null,
              triage.supplyRequest?.notes ? `Notes: ${triage.supplyRequest.notes}` : null,
              stockLine,
            ].filter(Boolean).join("\n"),
            original_message: body,
            ai_triage: {
              type: "supply_request",
              confidence: triage.confidence,
              supply_request: triage.supplyRequest || null,
              inventory_matches: inventoryMatches,
            },
            status: "open",
            reported_by: from,
            worker_phone: from,
            source: "sms",
          } as any)
          .select("id, short_id")
          .single();

        if (supplyErr) throw supplyErr;

        if (company?.manager_phone) {
          const mgrMsg = truncateForSms(
            `📦 SUPPLY ${supplyWo?.short_id || "REQUEST"}\n${worker.name || from} requested ${requestedQty} × ${itemName}.\n${stockLine}${triage.supplyRequest?.neededFor ? `\nNeeded for: ${triage.supplyRequest.neededFor}` : ""}`
          );
          await sendSMS(company.manager_phone, mgrMsg);
        }

        const workerMsg = truncateForSms(
          `${triage.workerResponse || `Got it — I logged a supply request for ${requestedQty} × ${itemName}.`} ${supplyWo?.short_id ? `(${supplyWo.short_id})` : ""}\n${stockLine}\nI've alerted ${company?.manager_name || "your manager"}.`
        );
        return twimlResponse(workerMsg);
      } catch (error) {
        console.error("[SMS] Supply request handling failed:", error);
        return twimlResponse("Sorry, I couldn't log that supply request right now. Please notify your manager.");
      }
    }

    if (triage.messageType === "issue_report") {
      try {
        const similarCompletedWorkOrders = triage.issue
          ? await findSimilarCompletedWorkOrders(worker.company_id, triage.issue)
          : [];

        if (triage.issue) {
          triage.issue.similarPastIssues = similarCompletedWorkOrders.length;
          triage.issue.isRecurring = similarCompletedWorkOrders.length > 0;
        }

        const criticalIncidentMeta = detectCriticalIncident(body, triage as any);
        const priorityProfile = getPriorityProfile(
          triage.issue?.priority || null,
          priorityProfiles,
          companyRuntimeSettings.priority_display_labels
        );
        const aiTriageExtra: Record<string, unknown> = {};
        if (criticalIncidentMeta) aiTriageExtra.critical_incident = criticalIncidentMeta;
        if (priorityProfile) aiTriageExtra.priority_profile = {
          level: priorityProfile.level,
          sla_hours: priorityProfile.sla_hours,
        };
        if (similarCompletedWorkOrders.length > 0) {
          aiTriageExtra.recurring_issue = {
            similar_past_issues: similarCompletedWorkOrders.length,
            recent_work_orders: similarCompletedWorkOrders.map((wo: any) => ({
              id: wo.id,
              short_id: wo.short_id,
              title: wo.title,
              completed_at: wo.completed_at,
            })),
          };
        }

        const wo = await createWorkOrderFromTriage(triage as any, worker.company_id, from, {
          originalMessage: body,
          source: imageAnalysisForTriage ? "photo" : "sms",
          aiTriageExtra: Object.keys(aiTriageExtra).length > 0 ? aiTriageExtra : undefined,
        });

        // Best-effort load WO for short_id + asset location
        const woFull = (await supabase
          .from("work_orders")
          .select("id, short_id, asset_id, asset_name, asset_tag, priority")
          .eq("id", wo.id)
          .single()).data as unknown as {
          id: UUID;
          short_id: string | null;
          asset_id: UUID | null;
          asset_name: string | null;
          asset_tag: string | null;
          priority: string | null;
        } | null;

        const bestTech = await findBestTechnician(worker.company_id, triage.issue?.category || "other", triage.issue?.assetId || undefined);

        let assignedToName: string | null = null;
        let assignedToPhone: string | null = null;

        if (bestTech?.id) {
          await assignWorkOrder(wo.id, bestTech.id);
          assignedToName = (bestTech as any).name || null;
          assignedToPhone = (bestTech as any).phone || null;

          const { error: assignedPhoneError } = await supabase
            .from("work_orders")
            .update({ assigned_to_phone: assignedToPhone || null } as any)
            .eq("id", wo.id);
          if (assignedPhoneError && assignedPhoneError.code !== "42703") {
            console.warn("[SMS] assigned_to_phone update warning:", assignedPhoneError?.message || null);
          }

          if (assignedToPhone) {
            const assetName = triage.issue?.assetName || woFull?.asset_name || "(unknown asset)";
            const assetLoc = woFull?.asset_id
              ? (await supabase.from("assets").select("location").eq("id", woFull.asset_id).single()).data?.location
              : null;

            const steps = (triage.issue?.suggestedActions || []).slice(0, 3).join("; ");
            const techLead = criticalIncidentMeta ? `CRITICAL WO ${woFull?.short_id || wo.id.slice(0, 8)}` : `NEW WO ${woFull?.short_id || wo.id.slice(0, 8)}`;
            const techMsg = truncateForSms(`${techLead}\n${assetName}${assetLoc ? ` @ ${assetLoc}` : ""}\nIssue: ${triage.issue?.symptomSummary || "Reported issue"}${steps ? `\nTry: ${steps}` : ""}\nReply START when you begin.`);
            await sendSMS(assignedToPhone, techMsg);
          }
        }

        const shouldNotifyManagerForWorkOrder = shouldSendManagerWorkOrderAlert(companyRuntimeSettings, {
          priority: triage.issue?.priority || null,
          criticalIncident: Boolean(criticalIncidentMeta),
        });

        if (shouldNotifyManagerForWorkOrder && company?.manager_phone) {
          const assetName = triage.issue?.assetName || "(unknown asset)";
          const assigned = assignedToName || "UNASSIGNED";

          // Calculate downtime cost estimate
          let costLine = "";
          try {
            const { calculateDowntimeCost, formatCost } = require("@/lib/downtime-cost-engine");
            const costEst = await calculateDowntimeCost(wo.id);
            if (costEst && costEst.totalEstimatedCost > 0) {
              costLine = `\n💰 Est. cost: ${formatCost(costEst.totalEstimatedCost)} (${formatCost(costEst.costPerMinute)}/min)`;
              await supabase.from("work_orders").update({ downtime_cost_estimate: costEst.totalEstimatedCost }).eq("id", wo.id);
            }
          } catch { /* cost engine not critical */ }
          const slaLine = priorityProfile ? `\nTarget SLA: ${priorityProfile.sla_hours}h` : "";
          const recurrenceLine = similarCompletedWorkOrders.length > 0
            ? `\nRecurring: ${similarCompletedWorkOrders.length} similar completed WO${similarCompletedWorkOrders.length === 1 ? "" : "s"} in last 180d`
            : "";

          const header = criticalIncidentMeta ? `🚨 CRITICAL WO ${woFull?.short_id || wo.id.slice(0, 8)}` : `⚠️ ALERT WO ${woFull?.short_id || wo.id.slice(0, 8)}`;
          const incidentLine = criticalIncidentMeta ? `\nIncident: ${criticalIncidentMeta.kind.replaceAll("_", " ")}` : "";
          const priorityLabel = priorityProfile?.display_label || triage.issue?.priority || "unknown";
          const mgrMsg = truncateForSms(`${header}\nPriority: ${priorityLabel}\n${triage.issue?.priorityReasoning || ""}${incidentLine}${slaLine}${recurrenceLine}\nAsset: ${assetName}\nFrom: ${worker.name || from}\nAssigned: ${assigned}${costLine}`);
          await sendSMS(company.manager_phone, mgrMsg);
        }

        const workerReply = criticalIncidentMeta
          ? truncateForSms(`${triage.workerResponse || "Got it."}\n\nI flagged this as a critical incident and alerted the team.`)
          : truncateForSms(triage.workerResponse || "OK");

        return twimlResponse(workerReply);
      } catch (e) {
        console.error("[SMS] Work order create/assign failed:", e);
        return twimlResponse("Sorry, I couldn't open a work order right now. Please notify your manager.");
      }
    }

    if (triage.messageType === "work_order_update") {
      const woId = triage.workOrderUpdate?.workOrderId;
      const action = triage.workOrderUpdate?.action;

      // Fallback: if AI didn't identify WO, use most recent active WO for this worker
      let resolvedWoId = woId;
      let resolvedAction = action;
      if (!resolvedWoId && activeWorkOrders && activeWorkOrders.length > 0) {
        resolvedWoId = pickTargetWorkOrderForStatusUpdate(activeWorkOrders, worker.id, from)?.id;
      }
      if (!resolvedAction) {
        const upperBody = body.toUpperCase().trim();
        if (upperBody === "START" || upperBody === "STARTED" || upperBody === "ON IT") resolvedAction = "start";
        else if (upperBody.startsWith("COMPLETE") || upperBody === "DONE" || upperBody === "FIXED") resolvedAction = "complete";
      }

      if (!resolvedWoId || !resolvedAction) {
        return twimlResponse((triage.workerResponse || "Got it.").slice(0, 480));
      }

      // Bug 3 fix: support both short_id (WO-XXXX) and UUID
      const isShortId = /^WO-\d+$/i.test(resolvedWoId);
      const woFilter = (query: any) => isShortId
        ? query.eq("short_id", resolvedWoId)
        : query.eq("id", resolvedWoId);

      if (resolvedAction === "start") {
        const { data: startedWo } = await woFilter(
          supabase.from("work_orders").select("id, short_id, title, asset_name, ai_triage")
        ).single();

        const { error: startErr } = await woFilter(supabase.from("work_orders").update({ status: "in_progress", started_at: new Date().toISOString() }));
        if (startErr) {
          console.error("[SMS] WO start update error:", startErr);
          return twimlResponse("Sorry, couldn't update that work order. Please try again.");
        }

        const criticalIncidentMeta = getCriticalIncidentMeta((startedWo as any)?.ai_triage || null);
        if (criticalIncidentMeta && criticalSmsEnabled && company?.manager_phone) {
          await sendSMS(
            company.manager_phone,
            truncateForSms(`CRITICAL UPDATE ${(startedWo as any)?.short_id || resolvedWoId}\n${worker.name || "Assigned tech"} started on ${(startedWo as any)?.asset_name || (startedWo as any)?.title || "the incident"}.`)
          );
        }

        return twimlResponse("OK Marked started.");
      }

      if (resolvedAction === "complete") {
        // Pull WO for asset context
        const { data: woFullForUpdate } = await woFilter(
          supabase.from("work_orders").select("id, short_id, title, asset_id, asset_name, ai_triage")
        ).single();

        const { error: completeErr } = await woFilter(
          supabase.from("work_orders").update({
            status: "completed",
            completed_at: new Date().toISOString(),
            resolution_notes: triage.workOrderUpdate?.completionNotes || null,
            parts_used: triage.workOrderUpdate?.partsUsed || [],
          })
        );
        if (completeErr) {
          console.error("[SMS] WO complete update error:", completeErr);
          return twimlResponse("Sorry, couldn't update that work order. Please try again.");
        }

        // Create follow-up WOs for any secondary issues
        const secondary = (triage.workOrderUpdate?.secondaryIssues || []).slice(0, 3);
        for (const s of secondary) {
          await supabase.from("work_orders").insert({
            company_id: worker.company_id,
            asset_id: (woFullForUpdate as any)?.asset_id || null,
            title: `Follow-up: ${s}`.slice(0, 120),
            description: `Auto-created follow-up from completion of ${resolvedWoId}: ${s}`,
            status: "open",
            reported_by: from,
            priority: "medium",
            category: "other",
            source: "sms",
            parent_wo_id: (woFullForUpdate as any)?.id || resolvedWoId,
          } as any);
        }

        await finalizeCompletedWorkOrder((woFullForUpdate as any)?.id || resolvedWoId);

        const criticalIncidentMeta = getCriticalIncidentMeta((woFullForUpdate as any)?.ai_triage || null);
        if (criticalIncidentMeta && criticalSmsEnabled && company?.manager_phone) {
          await sendSMS(
            company.manager_phone,
            truncateForSms(`CRITICAL RESOLVED ${(woFullForUpdate as any)?.short_id || resolvedWoId}\n${worker.name || "Assigned tech"} marked ${(woFullForUpdate as any)?.asset_name || (woFullForUpdate as any)?.title || "the incident"} complete.`)
          );
        }

        return twimlResponse("OK Marked complete. Thanks!");
      }

      return twimlResponse((triage.workerResponse || "OK").slice(0, 480));
    }

    if (triage.messageType === "pm_result") {
      // Minimal logging for now; follow-up work orders if flagged
      // TEMP: best-effort insert until PM flow has proper pm_schedule_id/work_order_id wiring
      try {
        await supabase.from("pm_completions").insert({
          pm_schedule_id: null,
          work_order_id: null,
          completed_by: (worker.id as any) || null,
          checklist_results: [],
          findings: body,
          photos: [],
          completed_at: new Date().toISOString(),
        } as any);
      } catch (e) {
        console.warn("[SMS] pm_completions insert failed (best-effort):", e);
      }

      return twimlResponse((triage.workerResponse || "OK Logged.").slice(0, 480));
    }

    // question/general -> search knowledge base first, then fall through to RAG

    // Search auto-generated knowledge articles first
    let knowledgeContext = "";
    try {
      const { searchKnowledge } = require("@/lib/knowledge-engine");
      const knowledgeResults = await searchKnowledge(body, worker.company_id, 3);
      if (knowledgeResults.length > 0) {
        knowledgeContext = "\n\nKNOWLEDGE FROM PAST REPAIRS:\n" + knowledgeResults.map((a: any) =>
          `[${a.title}] Problem: ${a.problem || ""} Solution: ${a.solution || ""}`
        ).join("\n");
      }
    } catch { /* knowledge engine not critical */ }

    // CASE 5: Regular text question (existing logic)
    const relevantChunks = await searchDocuments(body, worker.company_id);
    const context = relevantChunks.map((c: any) => c.content).join("\n\n");
    
    // Get unique source documents for attribution
    const sourceDocuments = [...new Set(relevantChunks
      .map((c: any) => c.document_name)
      .filter(Boolean)
    )];
    const sourcesText = sourceDocuments.length > 0 
      ? `\n\nSOURCE DOCUMENTS: ${sourceDocuments.join(", ")}\nWhen answering, reference the source like "Per [document name]:" or "According to [document name]:"`
      : "";
    
    const similarityScore = relevantChunks.length > 0 
      ? Math.round(relevantChunks[0].similarity * 100) 
      : 0;

    // Enhanced system prompt for manufacturing context
    const isSafetyQuestion = containsSafetyTopic(body);
    const systemPrompt = `You are Sidekick, the AI assistant for ${company?.name || "this company"}. You're texting with ${worker.name || "a team member"}.

${isSafetyQuestion ? `️ SAFETY QUESTION — Be extra careful:
- Lead with safety warnings and required PPE
- Cite specific SOPs when available ("Per Safety Manual:")
- If unsure about ANY safety procedure, say so and recommend checking with supervisor
- NEVER guess on lockout/tagout, chemical handling, or equipment procedures` : ""}

YOUR JOB: Answer workplace questions using the company's documents and knowledge base. You're like a coworker who knows everything.

HOW TO RESPOND:
- Direct and conversational — this is SMS, not email
- Cite company docs naturally ("Per your handbook:", "According to your safety manual:")
- Keep it under 400 characters but be helpful and complete
- If docs don't cover it, use general industry knowledge
- Never say "I'm an AI" — you're Sidekick
- IMPORTANT: The worker's language has been detected as "${detectedLang}". ${detectedLang !== "en" ? `You MUST respond entirely in ${detectedLang}. Do NOT respond in English.` : "Respond in English."}
- If you can't answer well, offer to ask ${company?.manager_name || "the manager"}${sourcesText}`;
    
    const userMessage = context
      ? `Context from company documents:\n${context}${knowledgeContext}\n\nQuestion: ${body}`
      : knowledgeContext
        ? `Context from past repairs and knowledge base:${knowledgeContext}\n\nQuestion: ${body}`
        : `Question: ${body}\n\nNote: No relevant documents found. Provide a helpful general response and mention they should check with their manager for specific policies.`;

    const answer = await getAIResponse(systemPrompt, userMessage);
    
    const responseTime = Date.now() - startTime;
    const lowConfidence = isLowConfidenceAnswer(answer);

    const { data: questionRecord } = await insertQuestionRecord({
      company_id: worker.company_id,
      worker_phone: from,
      worker_name: worker.name,
      question: body,
      answer: answer,
      confidence: similarityScore,
      response_time_ms: responseTime,
      manager_notified: false,
      language: detectedLang,
      channel: incomingChannel,
    });

    if (lowConfidence && company?.manager_phone && questionRecord) {
      await supabase
        .from("workers")
        .update({ pending_escalation_question_id: questionRecord.id })
        .eq("phone", from);
      
      return twimlResponse(`${answer}\n\n---\nWant me to notify ${company.manager_name || "your manager"} about this question?\n\nReply Y for Yes, N for No`);
    }

    return twimlResponse(answer);

  } catch (error) {
    console.error("[SMS] Error:", error);
    return twimlResponse("Sorry, I encountered an error. Please try again in a moment.");
  }
}
