import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import twilio from "twilio";
import { supabase } from "@/lib/supabase";
import { createEmbedding } from "@/lib/embeddings";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

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

  return data || [];
}

// ============================================
// NEW: Image Analysis Functions
// ============================================

interface ImageAnalysis {
  description: string;
  searchQueries: string[];
  isSafetyRelated: boolean;
  identifiedItems: string[];
}

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
  const analysisPrompt = `You are an expert manufacturing and industrial assistant. Analyze this image from a factory floor worker.

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
  
  // Build a direct, confident response based on what we identified
  const identifiedItems = imageAnalysis.identifiedItems.length > 0 
    ? imageAnalysis.identifiedItems.join(", ")
    : null;

  const systemPrompt = `You are Sidekick, a helpful manufacturing assistant. Give a SHORT, DIRECT answer (under 250 chars).

You analyzed a worker's photo and found:
- What you see: ${imageAnalysis.description}
- Specific items: ${identifiedItems || "not specifically identified"}
- Safety concern: ${imageAnalysis.isSafetyRelated ? "YES" : "no"}

${workerQuestion ? `Worker asked: "${workerQuestion}"` : "Worker wants to know about this item."}

RESPOND DIRECTLY. Examples of GOOD responses:
- "Those are Phillips head screws. You'll need a #2 Phillips screwdriver."
- "That's a 3/8" hex bolt. Use a 9/16" wrench or socket."
- "⚠️ That's a hydraulic line. Depressurize before disconnecting. Need 2 wrenches."

DO NOT say "I don't have information" - you DO have information from the image analysis above.
DO NOT ask clarifying questions - just answer based on what you see.
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
    return `⚠️ I see: ${items}. Check safety procedures before proceeding.`;
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
    const from = formData.get("From")?.toString() || "";
    
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
        `💬 ${companyName} replied to your question:\n\n"${pendingQuestion.question}"\n\n➡️ ${managerAnswer}`
      );
      
      await saveToKnowledgeBase(
        pendingQuestion.company_id,
        pendingQuestion.question,
        managerAnswer
      );
      
      return twimlResponse(`Thanks! I've sent your answer to ${pendingQuestion.worker_name || "the worker"} and saved it for future questions. 👍`);
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
              `📋 Sidekick Alert for ${company.name}\n\n${worker.name || "A worker"} asked:\n"${question.question}"\n\n💬 Reply with your answer and I'll send it to them & remember it for next time.\n\nOr reply SKIP to ignore.`
            );
          }
          
          await supabase
            .from("workers")
            .update({ pending_escalation_question_id: null })
            .eq("phone", from);
          
          return twimlResponse(`Got it! I've asked ${company?.manager_name || "your manager"}. They can reply directly and I'll forward their answer to you. 👍`);
        }
      } else if (response === "N" || response === "NO") {
        await supabase
          .from("workers")
          .update({ pending_escalation_question_id: null })
          .eq("phone", from);
        
        return twimlResponse("No problem! Let me know if you have other questions. 👍");
      }
      
      await supabase
        .from("workers")
        .update({ pending_escalation_question_id: null })
        .eq("phone", from);
    }

    // CASE 1: New user trying to join with access code
    if (!worker && body.toUpperCase().startsWith("JOIN ")) {
      const accessCode = body.substring(5).trim().toUpperCase();
      
      const { data: company } = await supabase
        .from("companies")
        .select("id, name, access_code")
        .eq("access_code", accessCode)
        .single();
      
      if (!company) {
        const companyName = body.substring(5).trim();
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
      
      return twimlResponse(`Welcome to ${company.name}! 🎉 What's your first name?`);
    }

    // CASE 2: New user without JOIN command
    if (!worker) {
      return twimlResponse("Welcome to Sidekick! 👋 Text JOIN followed by your company's 6-letter code to get started.\n\nExample: JOIN ABC123");
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
        .select("name")
        .eq("id", worker.company_id)
        .single();
      
      return twimlResponse(`Thanks ${name}! 🙌 You're all set. Ask me anything about ${company?.name || "your workplace"} - policies, procedures, schedules, and more. You can also send photos of equipment or parts!`);
    }

    // CASE 4: Registered worker - now with IMAGE SUPPORT
    const { data: company } = await supabase
      .from("companies")
      .select("name, manager_phone, manager_name")
      .eq("id", worker.company_id)
      .single();

    // ============================================
    // NEW: Handle image messages
    // ============================================
    if (numMedia > 0 && mediaUrl) {
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
      const uniqueChunks = allRelevantChunks.filter((chunk, index, self) =>
        index === self.findIndex(c => c.content === chunk.content)
      ).slice(0, 5); // Keep top 5
      
      const bestSimilarity = uniqueChunks.length > 0 
        ? Math.round(Math.max(...uniqueChunks.map(c => c.similarity)) * 100)
        : 0;
      
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
      const questionText = body 
        ? `[IMAGE] ${body}` 
        : `[IMAGE] ${imageAnalysis.description}`;
      
      const { data: questionRecord } = await supabase.from("questions").insert({
        company_id: worker.company_id,
        worker_phone: from,
        worker_name: worker.name,
        question: questionText,
        answer: answer,
        confidence: bestSimilarity,
        response_time_ms: responseTime,
        manager_notified: false,
        // You could add: image_url: mediaUrl (if you want to store it)
      }).select().single();

      // For safety-related images with low confidence, always offer escalation
      if ((imageAnalysis.isSafetyRelated || lowConfidence) && company?.manager_phone && questionRecord) {
        await supabase
          .from("workers")
          .update({ pending_escalation_question_id: questionRecord.id })
          .eq("phone", from);
        
        const safetyPrefix = imageAnalysis.isSafetyRelated ? "⚠️ SAFETY: " : "";
        return twimlResponse(`${safetyPrefix}${answer}\n\n---\nWant me to ask ${company.manager_name || "your manager"} about this?\n\nReply Y/N`);
      }

      return twimlResponse(answer);
    }
    // ============================================
    // END: Handle image messages
    // ============================================
    
    // CASE 5: Regular text question (existing logic)
    const relevantChunks = await searchDocuments(body, worker.company_id);
    const context = relevantChunks.map((c: any) => c.content).join("\n\n");
    
    const similarityScore = relevantChunks.length > 0 
      ? Math.round(relevantChunks[0].similarity * 100) 
      : 0;

    // Enhanced system prompt for manufacturing context
    const isSafetyQuestion = containsSafetyTopic(body);
    const systemPrompt = `You are Sidekick, a helpful workplace assistant for ${worker.name || "a worker"} at ${company?.name || "their company"}.

${isSafetyQuestion ? `⚠️ SAFETY QUESTION DETECTED - Always:
1. Lead with any safety warnings or required PPE
2. Reference specific SOPs when available (e.g., "According to SOP-12...")
3. If unsure about any safety procedure, say so and recommend checking with supervisor
4. Never guess on lockout/tagout, chemical handling, or equipment procedures` : ""}

Answer questions based on the provided context. Be concise, friendly, and helpful. Keep responses under 300 characters for SMS.
If you reference a specific document or SOP, mention it.
If you don't have enough information to answer, say so honestly and mention they should check with their manager.`;
    
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
      
      return twimlResponse(`${answer}\n\n---\n⚠️ Want me to notify ${company.manager_name || "your manager"} about this question?\n\nReply Y for Yes, N for No`);
    }

    return twimlResponse(answer);

  } catch (error) {
    console.error("[SMS] Error:", error);
    return twimlResponse("Sorry, I encountered an error. Please try again in a moment.");
  }
}
