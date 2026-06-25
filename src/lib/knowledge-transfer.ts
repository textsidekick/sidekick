import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "placeholder" });

// ============================================
// Knowledge Transfer Sessions
// When an experienced worker is leaving/retiring, 
// Sidekick conducts structured knowledge capture sessions
// ============================================

interface TransferSession {
  id: string;
  company_id: string;
  worker_name: string;
  worker_phone: string;
  status: "active" | "completed";
  topics_covered: string[];
  articles_generated: number;
  created_at: string;
}

interface TransferQuestion {
  question: string;
  category: string;
  why: string;
}

// Generate smart questions to ask an experienced worker about a specific asset
export async function generateTransferQuestions(
  companyId: string,
  assetId?: string
): Promise<TransferQuestion[]> {
  // Get asset info and existing knowledge gaps
  let assetContext = "";
  if (assetId) {
    const { data: asset } = await supabase.from("assets").select("*").eq("id", assetId).single();
    const { data: wos } = await supabase
      .from("work_orders")
      .select("title, category, resolution_notes")
      .eq("asset_id", assetId)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(20);

    if (asset) {
      assetContext = `Asset: ${asset.name} (${asset.type || ""}, ${asset.manufacturer || ""} ${asset.model || ""})
Location: ${asset.location || "unknown"}
Recent work orders: ${(wos || []).map((w: any) => w.title).join("; ")}`;
    }
  }

  // Get existing knowledge to avoid duplicating
  const { data: existingArticles } = await supabase
    .from("knowledge_articles")
    .select("title, tags")
    .eq("company_id", companyId)
    .limit(50);

  const existingTopics = (existingArticles || []).map((a: any) => a.title).join("; ");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 800,
    messages: [{
      role: "user",
      content: `You are helping capture tribal knowledge from an experienced manufacturing worker before they retire. Generate 8-10 specific questions to ask them.

${assetContext ? `ABOUT THIS MACHINE:\n${assetContext}\n` : "GENERAL FACTORY KNOWLEDGE"}

KNOWLEDGE WE ALREADY HAVE:
${existingTopics || "None yet"}

Generate questions that capture knowledge a new hire would struggle to figure out on their own. Focus on:
- Quirks and tricks specific to their machines ("Machine 7 runs better if you...")
- Troubleshooting shortcuts ("When you hear X noise, it's usually Y")
- Unwritten procedures ("Before you do X, always check Y first")  
- Vendor/supplier knowledge ("For this part, always use vendor Z because...")
- Safety gotchas ("The thing nobody tells you about this machine is...")
- Quality secrets ("To get the best finish, you need to...")

Return JSON array:
[{"question": "specific question", "category": "troubleshooting|procedure|safety|quality|vendor|machine_quirk", "why": "why this knowledge matters"}]

JSON only.`,
    }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  try {
    const match = text.match(/\[[\s\S]*\]/);
    if (match) return JSON.parse(match[0]);
  } catch { /* fall through */ }

  return [
    { question: "What's the most common thing that goes wrong with your equipment, and how do you fix it?", category: "troubleshooting", why: "Captures the #1 issue" },
    { question: "What's something about your machines that isn't in any manual?", category: "machine_quirk", why: "Captures undocumented knowledge" },
    { question: "What's the biggest safety risk new people don't know about?", category: "safety", why: "Critical safety knowledge" },
    { question: "If you could teach a new hire just one thing, what would it be?", category: "procedure", why: "Most important knowledge" },
  ];
}

// Process an experienced worker's answer and create a knowledge article
export async function processTransferAnswer(
  companyId: string,
  workerName: string,
  question: string,
  answer: string,
  assetId?: string
): Promise<string | null> {
  // Get asset info
  let assetName = null;
  let equipmentType = null;
  if (assetId) {
    const { data: asset } = await supabase.from("assets").select("name, type").eq("id", assetId).single();
    if (asset) {
      assetName = asset.name;
      equipmentType = asset.type;
    }
  }

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 500,
    messages: [{
      role: "user",
      content: `Convert this experienced worker's answer into a reusable knowledge article.

Question asked: "${question}"
Worker's answer: "${answer}"
Worker: ${workerName}
${assetName ? `Machine: ${assetName}` : ""}

Return JSON:
{
  "title": "Clear, searchable title",
  "problem": "What problem or situation this knowledge addresses",
  "solution": "The knowledge/procedure/tip, written clearly for a new worker",
  "tags": ["relevant", "tags"]
}

JSON only.`,
    }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  let article: any = {};
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) article = JSON.parse(match[0]);
  } catch { /* use defaults */ }

  const { data, error } = await supabase.from("knowledge_articles").insert({
    company_id: companyId,
    asset_id: assetId || null,
    asset_name: assetName,
    equipment_type: equipmentType,
    title: article.title || `Knowledge from ${workerName}: ${question.slice(0, 50)}`,
    problem: article.problem || question,
    solution: article.solution || answer,
    tags: [...(article.tags || []), "knowledge_transfer", workerName.toLowerCase().replace(/\s+/g, "_")],
    source_work_order_id: null, // Not from a work order
  }).select("id").single();

  if (error) {
    console.error("[knowledge-transfer] Insert error:", error.message);
    return null;
  }
  return data?.id || null;
}

// Start a knowledge transfer session via SMS
// Sidekick texts the experienced worker a series of questions
export async function startTransferSession(
  companyId: string,
  workerPhone: string,
  workerName: string,
  assetId?: string
): Promise<{ questions: TransferQuestion[]; sessionId: string }> {
  const questions = await generateTransferQuestions(companyId, assetId);
  
  // Store session state (using worker record for simplicity)
  // In production, this would be a dedicated transfer_sessions table
  const sessionId = `kt-${Date.now()}`;
  
  return { questions, sessionId };
}
