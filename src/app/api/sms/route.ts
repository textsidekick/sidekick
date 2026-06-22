import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import twilio from "twilio";
import { supabase } from "@/lib/supabase";
import { createEmbedding } from "@/lib/embeddings";
import { normalizePhoneNumber } from "@/lib/phone";
import { triageIncomingMessage } from "@/lib/ai-triage";
import {
  assignWorkOrder,
  createWorkOrderFromTriage,
  findBestTechnician,
} from "@/lib/work-order-manager";
import type { Asset as OpsAsset, UUID } from "@/types/operations";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder' });
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
  const embedding = await createEmbedding(question);
  
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_company_id: companyId,
    match_count: 5,
  });

  if (error) {
    console.error("Vector search error:", error);
    return [];
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
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
                data: base64,
              },
            },
            {
              type: "text",
              text: analysisPrompt,
            },
          ],
        },
      ],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    
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
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      messages: [{ role: "user", content: systemPrompt }],
    });

    if (response.content[0].type === "text") {
      let answer = response.content[0].text;
      // If Claude still hedges, use our fallback
      if (answer.toLowerCase().includes("don't have") || answer.toLowerCase().includes("cannot identify")) {
        return buildDirectResponse(imageAnalysis, workerQuestion);
      }
      return answer;
    }
  } catch (error) {
    console.error("[SMS] Claude error for image response:", error);
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
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: systemPrompt,
      messages: [{ role: "user", content: userMessage }],
    });
    
    if (response.content[0].type === "text") {
      return response.content[0].text;
    }
  } catch (error) {
    console.error("[SMS] Claude error, falling back to GPT:", error);
  }
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 300,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
    });
    
    return response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("[SMS] GPT error:", error);
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

function twimlResponse(message: string): NextResponse {
  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`;
  return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const formData = await request.formData();
    const body = formData.get("Body")?.toString()?.trim() || "";
    const from = normalizePhoneNumber(formData.get("From")?.toString() || "");
    
    // NEW: Check for media attachments (images)
    const numMedia = parseInt(formData.get("NumMedia")?.toString() || "0", 10);
    const mediaUrl = formData.get("MediaUrl0")?.toString();
    const mediaType = formData.get("MediaContentType0")?.toString();
    
    console.log("[SMS] From:", from, "Body:", body, "NumMedia:", numMedia);

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
        return twimlResponse("Please text JOIN followed by your company's code. Example: JOIN ABC123");
      }
      
      if (normalized.startsWith("JOIN ")) {
        const accessCode = normalized.slice(5).trim();
        
        // Safety: ensure we didn't accidentally parse an empty code
        if (!accessCode) {
          return twimlResponse("Please text JOIN followed by your company's code. Example: JOIN ABC123");
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
            return twimlResponse("Sorry, that access code wasn't recognized. Please check with your manager for the correct code.");
          }

          await supabase.from("workers").insert({
            phone: from,
            company_id: legacyCompany.id,
            name: null,
            verified: false,
          });

          return twimlResponse(`Welcome to ${legacyCompany.name}! What's your first name?`);
        }

        await supabase.from("workers").insert({
          phone: from,
          company_id: company.id,
          name: null,
          verified: false,
        });

        return twimlResponse(`Welcome to ${company.name}! ! What's your first name?`);
      }
    }

    // CASE 2: New user without JOIN command
    if (!worker) {
      return twimlResponse("Welcome to Sidekick! Hi Text JOIN followed by your company's 6-letter code to get started.\n\nExample: JOIN ABC123");
    }

    // CASE 3: Worker exists but hasn't provided name yet
    if (worker && !worker.name) {
      const name = body.trim().split(" ")[0];
      
      if (name.length < 2 || name.length > 30) {
        return twimlResponse("Please reply with your first name to get started.");
      }
      
      await supabase
        .from("workers")
        .update({ name: name, verified: true })
        .eq("phone", from);
      
      const { data: company } = await supabase
        .from("companies")
        .select("name, metadata, industry")
        .eq("id", worker.company_id)
        .single();
      
      // Proactive welcome based on event type
      let welcomeMsg = `Thanks ${name}! \u{1F64C} Welcome to ${company?.name || "Sidekick"}.\nAsk me anything — schedule, location, details, whatever you need!`;
      try {
        const meta = typeof company?.metadata === "string" ? JSON.parse(company.metadata) : company?.metadata;
        const t = (meta?.type || company?.industry || "").toLowerCase();
        if (t.includes("market") || t.includes("fair"))
          welcomeMsg = `Thanks ${name}! \u{1F64C} Welcome to ${company?.name}.\n\nQuick question \u2014 are you coming as a shopper or a vendor? This helps me give you the right info!`;
        else if (t.includes("concert") || t.includes("performance") || t.includes("album"))
          welcomeMsg = `Thanks ${name}! \u{1F3A4} Welcome to ${company?.name}.\n\nWant me to RSVP you? I can also send you a reminder before the show. Or ask me anything \u2014 lineup, parking, merch.`;
        else if (t.includes("casting") || t.includes("audition"))
          welcomeMsg = `Thanks ${name}! \u{1F3AC} Welcome to ${company?.name}.\n\nDo you have any acting experience? No worries either way \u2014 I'll help you prep. I can also sign you up for a time slot!`;
        else if (t.includes("rally") || t.includes("political") || t.includes("speaker"))
          welcomeMsg = `Thanks ${name}! \u{1F3A4} Welcome to ${company?.name}.\n\nWant me to RSVP you? Spots are limited. I can also tell you what to bring and walk you through security info.`;
        else if (t.includes("party") || t.includes("social"))
          welcomeMsg = `Thanks ${name}! \u{1F389} Welcome to ${company?.name}.\n\nHow many people are you bringing? I can add your crew to the guest list. Also \u2014 the theme is NEON \u{1F525}`;
        else if (t.includes("blood") || t.includes("charity") || t.includes("drive"))
          welcomeMsg = `Thanks ${name}! \u{2764} Welcome to ${company?.name}.\n\nHave you donated blood before? I can walk you through what to expect. Want me to save you a time slot so you skip the line?`;
        else if (t.includes("meet") || t.includes("greet") || t.includes("autograph"))
          welcomeMsg = `Thanks ${name}! \u{270D} Welcome to ${company?.name}.\n\nBringing anything to get signed? I can tell you the autograph rules so you're ready. Want a reminder before doors open?`;
        else if (t.includes("kickbox") || t.includes("fitness") || t.includes("workshop"))
          welcomeMsg = `Thanks ${name}! \u{1F94A} Welcome to ${company?.name}.\n\nWhat's your experience level \u2014 beginner, intermediate, or advanced? I'll tell you exactly what to bring.`;
        else if (t.includes("restaurant") || t.includes("food"))
          welcomeMsg = `Thanks ${name}! \u{1F37D} Welcome to ${company?.name}.\n\nLooking to make a reservation, check the menu, or something else? I know this place inside and out.`;
      } catch {}
      
      return twimlResponse(welcomeMsg);
    }

    // CASE 4: Registered worker - get company info
    const { data: company } = await supabase
      .from("companies")
      .select("name, manager_phone, manager_name, industry, worker_count, metadata")
      .eq("id", worker.company_id)
      .single();

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
        
        // Use Deepgram which supports AMR format natively
        console.log("[SMS] Transcribing audio via Deepgram, mediaType:", mediaType);
        
        const deepgramResponse = await fetch("https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true", {
          method: "POST",
          headers: {
            "Authorization": `Token ${process.env.DEEPGRAM_API_KEY}`,
            "Content-Type": mediaType || "audio/amr",
          },
          body: Buffer.from(audioBuffer),
        });
        
        if (!deepgramResponse.ok) {
          const errText = await deepgramResponse.text();
          console.error("[SMS] Deepgram error:", errText);
          throw new Error(`Deepgram: ${errText.slice(0, 100)}`);
        }
        
        const deepgramResult = await deepgramResponse.json();
        const transcribedText = deepgramResult?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
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
        const { data: questionRecord } = await supabase.from("questions").insert({
          company_id: worker.company_id,
          worker_phone: from,
          worker_name: worker.name,
          question: `[VOICE] ${transcribedText}`,
          answer: answer,
          confidence: bestSimilarity,
          response_time_ms: responseTime,
          manager_notified: false,
        }).select().single();
        
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
        return twimlResponse(`Audio error: mediaType=${mediaType}, err=${error?.message?.slice(0, 80) || "unknown"}`);
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
    // AI TRIAGE (replaces regex issue detection)
    // ============================================
    const { data: assets } = await supabase
      .from("assets")
      .select("id, name, asset_tag")
      .eq("company_id", worker.company_id)
      .limit(200);

    const { data: activeWorkOrders } = await supabase
      .from("work_orders")
      .select("id, status, assigned_to, assigned_to_phone, technician_id, worker_phone, created_at")
      .eq("company_id", worker.company_id)
      .eq("worker_phone", from)
      .in("status", ["open", "assigned", "in_progress", "on_hold"])
      .order("created_at", { ascending: false })
      .limit(20);

    const triage = await triageIncomingMessage({
      message: body,
      workerPhone: from,
      companyId: worker.company_id,
      imageAnalysis: imageAnalysisForTriage,
      existingAssets: (assets || []) as any,
      activeWorkOrders: (activeWorkOrders || []) as any,
    });

    // Branch based on messageType
    if (triage.messageType === "issue_report") {
      try {
        const wo = await createWorkOrderFromTriage(triage as any, worker.company_id, from);

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

          if (assignedToPhone) {
            const assetName = triage.issue?.assetName || woFull?.asset_name || "(unknown asset)";
            const assetLoc = woFull?.asset_id
              ? (await supabase.from("assets").select("location").eq("id", woFull.asset_id).single()).data?.location
              : null;

            const steps = (triage.issue?.suggestedActions || []).slice(0, 3).join("; ");
            const techMsg = `NEW WO ${woFull?.short_id || wo.id.slice(0, 8)}\n${assetName}${assetLoc ? ` @ ${assetLoc}` : ""}\nIssue: ${triage.issue?.symptomSummary || "Reported issue"}${steps ? `\nTry: ${steps}` : ""}\nReply START when you begin.`.slice(
              0,
              480
            );
            await sendSMS(assignedToPhone, techMsg);
          }
        }

        if (triage.escalate && company?.manager_phone) {
          const assetName = triage.issue?.assetName || "(unknown asset)";
          const assigned = assignedToName || "UNASSIGNED";
          const mgrMsg = `ALERT WO ${woFull?.short_id || wo.id.slice(0, 8)}\nPriority: ${triage.issue?.priority || "unknown"} (${triage.issue?.priorityReasoning || ""})\nAsset: ${assetName}\nFrom: ${worker.name || from}\nAssigned: ${assigned}`.slice(
            0,
            480
          );
          await sendSMS(company.manager_phone, mgrMsg);
        }

        return twimlResponse((triage.workerResponse || "OK ").slice(0, 480));
      } catch (e) {
        console.error("[SMS] Work order create/assign failed:", e);
        return twimlResponse("Sorry, I couldn't open a work order right now. Please notify your manager.");
      }
    }

    if (triage.messageType === "work_order_update") {
      const woId = triage.workOrderUpdate?.workOrderId;
      const action = triage.workOrderUpdate?.action;

      if (!woId || !action) {
        return twimlResponse((triage.workerResponse || "Got it.").slice(0, 480));
      }

      if (action === "start") {
        await supabase.from("work_orders").update({ status: "in_progress", started_at: new Date().toISOString() }).eq("id", woId);
        return twimlResponse("OK Marked started.");
      }

      if (action === "complete") {
        // Pull WO for asset context
        const { data: woFullForUpdate } = await supabase
          .from("work_orders")
          .select("id, asset_id")
          .eq("id", woId)
          .single();

        await supabase
          .from("work_orders")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            resolution_notes: triage.workOrderUpdate?.completionNotes || null,
            parts_used: triage.workOrderUpdate?.partsUsed || [],
          })
          .eq("id", woId);

        // Create follow-up WOs for any secondary issues
        const secondary = (triage.workOrderUpdate?.secondaryIssues || []).slice(0, 3);
        for (const s of secondary) {
          await supabase.from("work_orders").insert({
            company_id: worker.company_id,
            asset_id: (woFullForUpdate as any)?.asset_id || null,
            title: `Follow-up: ${s}`.slice(0, 120),
            description: `Auto-created follow-up from completion of ${woId}: ${s}`,
            status: "open",
            reported_by: from,
            priority: "medium",
            category: "other",
            source: "sms",
            parent_wo_id: woId,
          } as any);
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

    // question/general -> use existing RAG pipeline below

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
- If the worker texts in ANY language other than English, respond in THEIR language. Auto-detect and match. Spanish, Chinese, Vietnamese, Tagalog, Korean, etc
- If you can't answer well, offer to ask ${company?.manager_name || "the manager"}${sourcesText}`;
    
    const userMessage = context
      ? `Context from company documents:\n${context}\n\nQuestion: ${body}`
      : `Question: ${body}\n\nNote: No relevant documents found. Provide a helpful general response and mention they should check with their manager for specific policies.`;

    const answer = await getAIResponse(systemPrompt, userMessage);
    
    const responseTime = Date.now() - startTime;
    const lowConfidence = isLowConfidenceAnswer(answer);

    const { data: questionRecord } = await supabase.from("questions").insert({
      company_id: worker.company_id,
      worker_phone: from,
      worker_name: worker.name,
      question: body,
      answer: answer,
      confidence: similarityScore,
      response_time_ms: responseTime,
      manager_notified: false,
    }).select().single();

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

