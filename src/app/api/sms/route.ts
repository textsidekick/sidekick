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
  isSopLookupRequest,
  extractSopTopic,
  TRAINING_COACH_FOLLOW_UP_TOPIC,
  TRAINING_COACH_TOPIC,
  SOP_LOOKUP_TOPIC,
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
import { detectLanguageFast, buildLanguageDirective, resolveLang } from "@/lib/korean";
import { getSopAnswerContext } from "@/lib/sop-retrieval";
import { getWorkerPositionContext, buildPositionPromptBlock } from "@/lib/position-context";

async function getPrimaryCompanyLocationId(companyId: string): Promise<string | null> {
  const { data } = await supabase
    .from("locations")
    .select("id")
    .eq("company_id", companyId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data?.id || null;
}

async function getCompanyLocations(companyId: string) {
  const { data } = await supabase
    .from("locations")
    .select("id,name,is_primary")
    .eq("company_id", companyId)
    .order("is_primary", { ascending: false })
    .order("name", { ascending: true });

  return data || [];
}

function normalizeLocationText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

async function resolveMessageLocationId(companyId: string, message: string, fallbackLocationId?: string | null): Promise<string | null> {
  const locations = await getCompanyLocations(companyId);
  if (!locations.length) return fallbackLocationId || null;

  const normalizedMessage = normalizeLocationText(message);
  const matched = locations.find((location: any) => {
    const normalizedName = normalizeLocationText(String(location.name || ""));
    return normalizedName && normalizedMessage.includes(normalizedName);
  });

  if (matched?.id) return matched.id;
  return fallbackLocationId || locations.find((location: any) => location.is_primary)?.id || locations[0]?.id || null;
}

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
  "team": [{ "name": "optional", "phone": "optional", "role": "operator|technician|supervisor|manager", "skills": ["optional"], "shift": "optional", "location": "optional" }],
  "knowledge": [{ "title": "required", "problem": "optional", "solution": "required", "asset_name": "optional", "equipment_type": "optional", "tags": ["optional"] }],
  "notes": ["short factual leftovers"]
}`;

  const parsedText = await completeJsonOpenAIFirst({
    system,
    user: `Current company context:\n${JSON.stringify(params.company || {}, null, 2)}\n\nManager update:\n${params.message}`,
    maxTokens: 900,
  });

  const match = parsedText.match(/\{[\s\S]*\}/);
  if (!match) {
    return { summary: "Update received, but I couldn't parse structured changes.", applied: 0 };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(match[0]);
  } catch {
    return { summary: "Update received, but the parsed changes were invalid.", applied: 0 };
  }

  let applied = 0;

  // Company-level updates
  if (parsed.company && typeof parsed.company === "object") {
    const companyUpdate: Record<string, unknown> = {};
    const name = cleanUpdateString(parsed.company.name);
    const industry = cleanUpdateString(parsed.company.industry);
    const managerName = cleanUpdateString(parsed.company.manager_name);
    const managerPhone = cleanUpdateString(parsed.company.manager_phone);
    if (name) companyUpdate.name = name;
    if (industry) companyUpdate.industry = industry;
    if (managerName) companyUpdate.manager_name = managerName;
    if (managerPhone) companyUpdate.manager_phone = normalizePhoneNumber(managerPhone);
    if (typeof parsed.company.worker_count === "number" && parsed.company.worker_count > 0) {
      companyUpdate.worker_count = parsed.company.worker_count;
    }
    if (Object.keys(companyUpdate).length) {
      await supabase.from("companies").update(companyUpdate).eq("id", params.companyId);
      applied += 1;
    }
  }

  // Assets
  for (const asset of Array.isArray(parsed.assets) ? parsed.assets : []) {
    const assetName = cleanUpdateString(asset?.name);
    if (!assetName) continue;
    await supabase.from("assets").upsert(
      {
        company_id: params.companyId,
        name: assetName,
        asset_tag: cleanUpdateString(asset.asset_tag),
        location: cleanUpdateString(asset.location),
        type: cleanUpdateString(asset.type),
        notes: cleanUpdateString(asset.notes),
      },
      { onConflict: "company_id,name" }
    );
    applied += 1;
  }

  // Team members
  for (const member of Array.isArray(parsed.team) ? parsed.team : []) {
    const phone = cleanUpdateString(member?.phone);
    const memberName = cleanUpdateString(member?.name);
    if (!phone && !memberName) continue;
    const row: Record<string, unknown> = {
      company_id: params.companyId,
      name: memberName || "Unknown",
      role: cleanUpdateString(member.role) || "operator",
      shift: cleanUpdateString(member.shift),
      location: cleanUpdateString(member.location),
      skills: Array.isArray(member.skills) ? member.skills.filter((s: unknown) => typeof s === "string") : [],
    };
    if (phone) row.phone = normalizePhoneNumber(phone);
    await supabase.from("workers").upsert(row, { onConflict: "company_id,phone" });
    applied += 1;
  }

  // Knowledge entries (with embeddings for retrieval)
  for (const entry of Array.isArray(parsed.knowledge) ? parsed.knowledge : []) {
    const title = cleanUpdateString(entry?.title);
    const solution = cleanUpdateString(entry?.solution);
    if (!title || !solution) continue;
    const content = [entry.problem ? `Problem: ${entry.problem}` : null, `Solution: ${solution}`]
      .filter(Boolean)
      .join("\n");
    const embedding = await createEmbedding(`${title}\n${content}`);
    await supabase.from("knowledge").insert({
      company_id: params.companyId,
      title,
      content,
      asset_name: cleanUpdateString(entry.asset_name),
      equipment_type: cleanUpdateString(entry.equipment_type),
      tags: Array.isArray(entry.tags) ? entry.tags.filter((t: unknown) => typeof t === "string") : [],
      source: "manager_sms",
      embedding,
    });
    applied += 1;
  }

  // Freeform notes
  for (const note of Array.isArray(parsed.notes) ? parsed.notes : []) {
    const noteText = cleanUpdateString(note);
    if (!noteText) continue;
    const embedding = await createEmbedding(noteText);
    await supabase.from("knowledge").insert({
      company_id: params.companyId,
      title: noteText.slice(0, 80),
      content: noteText,
      source: "manager_sms_note",
      embedding,
    });
    applied += 1;
  }

  return {
    summary: cleanUpdateString(parsed.summary) || "Update applied.",
    applied,
  };
}

// ---------------------------------------------------------------------------
// Manager training query handler
// ---------------------------------------------------------------------------
function isTrainingQuery(body: string): boolean {
  const lower = body.toLowerCase();
  const keywords = [
    "training", "교육", "progress", "진행", "assign", "배정",
    "completed", "완료", "who needs", "누가 필요", "enrollment", "수강",
    "training status", "교육 현황", "who completed", "완료한 사람",
  ];
  return keywords.some((kw) => lower.includes(kw));
}

async function handleManagerTrainingQuery(
  companyId: string,
  body: string,
  lang: string
): Promise<string | null> {
  if (!isTrainingQuery(body)) return null;

  // Use Claude to parse intent and extract entities
  const intentJson = await completeJsonOpenAIFirst({
    system: `You are a training management query parser for a workforce SMS app.
Parse the manager's message and return JSON with:
{
  "intent": "status_overview" | "who_completed" | "who_needs_training" | "individual_progress" | "assign_training" | "unknown",
  "training_path_name": "name of training path if mentioned, or null",
  "worker_name": "worker name if mentioned, or null",
  "department_name": "department name if mentioned, or null"
}
Examples:
- "Show training status" → intent: status_overview
- "Who completed forklift training?" → intent: who_completed, training_path_name: "forklift"
- "Who needs more training?" → intent: who_needs_training
- "What's 박민준's training progress?" → intent: individual_progress, worker_name: "박민준"
- "Assign forklift training to 물류부" → intent: assign_training, training_path_name: "forklift", department_name: "물류부"`,
    user: body,
    maxTokens: 300,
  });

  let parsed: any = {};
  try {
    const match = intentJson.match(/\{[\s\S]*\}/);
    if (match) parsed = JSON.parse(match[0]);
  } catch {
    return null;
  }

  const { intent, training_path_name, worker_name, department_name } = parsed;
  if (!intent || intent === "unknown") return null;

  if (intent === "status_overview") {
    const { data: paths } = await supabase
      .from("training_paths")
      .select("id")
      .eq("company_id", companyId);

    const { data: enrollments } = await supabase
      .from("training_enrollments")
      .select("status")
      .eq("company_id", companyId);

    const total = paths?.length || 0;
    const enrolled = enrollments?.length || 0;
    const completed = enrollments?.filter((e: any) => e.status === "completed").length || 0;
    const pct = enrolled > 0 ? Math.round((completed / enrolled) * 100) : 0;

    return lang === "ko"
      ? `📊 교육 현황:\n경로: ${total}개\n수강: ${enrolled}명\n완료: ${completed}명\n완료율: ${pct}%`
      : `📊 Training Status:\nPaths: ${total}\nEnrolled: ${enrolled}\nCompleted: ${completed}\nCompletion: ${pct}%`;
  }

  if (intent === "who_completed") {
    let pathId: string | null = null;
    if (training_path_name) {
      const { data: paths } = await supabase
        .from("training_paths")
        .select("id,name")
        .eq("company_id", companyId)
        .ilike("name", `%${training_path_name}%`);
      pathId = paths?.[0]?.id || null;
    }

    let query = supabase
      .from("training_enrollments")
      .select("worker_id, workers(name)")
      .eq("company_id", companyId)
      .eq("status", "completed");

    if (pathId) query = query.eq("training_path_id", pathId);

    const { data: completions } = await query;
    const names = (completions || []).map((e: any) => e.workers?.name || "Unknown");

    if (!names.length) {
      return lang === "ko"
        ? `${training_path_name || "해당 교육"} 완료자가 없습니다.`
        : `No one has completed ${training_path_name || "that training"} yet.`;
    }
    const label = training_path_name ? `"${training_path_name}"` : "training";
    return lang === "ko"
      ? `✅ ${label} 완료자 (${names.length}명):\n${names.join(", ")}`
      : `✅ Completed ${label} (${names.length}):\n${names.join(", ")}`;
  }

  if (intent === "who_needs_training") {
    // Workers with enrollments in_progress or not enrolled at all
    const { data: enrolled } = await supabase
      .from("training_enrollments")
      .select("worker_id, status")
      .eq("company_id", companyId)
      .neq("status", "completed");

    const { data: allWorkers } = await supabase
      .from("workers")
      .select("id,name")
      .eq("company_id", companyId);

    const enrolledWorkerIds = new Set((enrolled || []).map((e: any) => e.worker_id));
    const notStarted = (allWorkers || []).filter((w: any) => !enrolledWorkerIds.has(w.id));
    const inProgress = (enrolled || []);

    const needsTraining = [
      ...notStarted.map((w: any) => `${w.name} (not started)`),
      ...inProgress.map((e: any) => {
        const worker = (allWorkers || []).find((w: any) => w.id === e.worker_id);
        return worker ? `${worker.name} (in progress)` : null;
      }).filter(Boolean),
    ];

    if (!needsTraining.length) {
      return lang === "ko" ? "모든 직원이 교육을 완료했습니다! 🎉" : "All workers have completed training! 🎉";
    }

    const lines = needsTraining.slice(0, 10).join("\n");
    const more = needsTraining.length > 10 ? `\n...and ${needsTraining.length - 10} more` : "";
    return lang === "ko"
      ? `📋 교육 필요 직원 (${needsTraining.length}명):\n${lines}${more}`
      : `📋 Needs training (${needsTraining.length}):\n${lines}${more}`;
  }

  if (intent === "individual_progress") {
    if (!worker_name) {
      return lang === "ko" ? "직원 이름을 알려주세요." : "Please provide the worker's name.";
    }
    const { data: workers } = await supabase
      .from("workers")
      .select("id,name")
      .eq("company_id", companyId)
      .ilike("name", `%${worker_name}%`);

    if (!workers?.length) {
      return lang === "ko" ? `"${worker_name}"을(를) 찾을 수 없습니다.` : `Worker "${worker_name}" not found.`;
    }

    const w = workers[0];
    const { data: enrollments } = await supabase
      .from("training_enrollments")
      .select("status, current_step, completed_at, training_paths(name)")
      .eq("company_id", companyId)
      .eq("worker_id", w.id);

    if (!enrollments?.length) {
      return lang === "ko" ? `${w.name}: 등록된 교육이 없습니다.` : `${w.name}: No training enrollments found.`;
    }

    const lines = enrollments.map((e: any) => {
      const pathName = (e as any).training_paths?.name || "Unknown path";
      if (e.status === "completed") return `✅ ${pathName}`;
      return `🔄 ${pathName} (step ${e.current_step || 1})`;
    }).join("\n");

    return lang === "ko"
      ? `📚 ${w.name} 교육 진행 현황:\n${lines}`
      : `📚 ${w.name}'s training:\n${lines}`;
  }

  if (intent === "assign_training") {
    if (!training_path_name) {
      return lang === "ko" ? "교육 경로명을 알려주세요." : "Please specify the training path name.";
    }

    const { data: paths } = await supabase
      .from("training_paths")
      .select("id,name")
      .eq("company_id", companyId)
      .ilike("name", `%${training_path_name}%`);

    if (!paths?.length) {
      return lang === "ko"
        ? `"${training_path_name}" 교육 경로를 찾을 수 없습니다.`
        : `Training path "${training_path_name}" not found.`;
    }
    const path = paths[0];

    let targetWorkers: any[] = [];

    if (department_name) {
      // Try to resolve department by name
      const { data: depts } = await supabase
        .from("departments")
        .select("id")
        .eq("company_id", companyId)
        .ilike("name", `%${department_name}%`);

      if (depts?.length) {
        const { data: ws } = await supabase
          .from("workers")
          .select("id,name")
          .eq("company_id", companyId)
          .eq("department_id", depts[0].id);
        targetWorkers = ws || [];
      }
    } else if (worker_name) {
      const { data: ws } = await supabase
        .from("workers")
        .select("id,name")
        .eq("company_id", companyId)
        .ilike("name", `%${worker_name}%`);
      targetWorkers = ws || [];
    }

    if (!targetWorkers.length) {
      return lang === "ko" ? "배정할 직원을 찾을 수 없습니다." : "No workers found to assign training to.";
    }

    let assigned = 0;
    for (const w of targetWorkers) {
      const { data: existing } = await supabase
        .from("training_enrollments")
        .select("id")
        .eq("company_id", companyId)
        .eq("worker_id", w.id)
        .eq("training_path_id", path.id)
        .maybeSingle();

      if (!existing) {
        await supabase.from("training_enrollments").insert({
          company_id: companyId,
          worker_id: w.id,
          training_path_id: path.id,
          status: "not_started",
          current_step: 0,
        });
        assigned += 1;
      }
    }

    const target = department_name || worker_name || "workers";
    return lang === "ko"
      ? `✅ "${path.name}" 교육을 ${target}에게 배정했습니다. (${assigned}명 신규 배정)`
      : `✅ Assigned "${path.name}" to ${target}. (${assigned} new enrollment${assigned === 1 ? "" : "s"})`;
  }

  return null;
}

function twimlResponse(message: string) {
  const twiml = new twilio.twiml.MessagingResponse();
  twiml.message(message);
  return new NextResponse(twiml.toString(), {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

// ---------------------------------------------------------------------------
// Position selection (inline — no separate module)
// If a worker has no position, we list the company's positions and ask them
// to reply with a number to choose. e.g. "1. 홀 서빙  2. 주방 보조"
// ---------------------------------------------------------------------------
async function listCompanyPositions(companyId: string) {
  const { data } = await supabase
    .from("positions")
    .select("id,name,name_en")
    .eq("company_id", companyId)
    .order("name", { ascending: true });
  return data || [];
}

function buildPositionPrompt(positions: any[], lang: string): string {
  const lines = positions
    .map((p: any, i: number) => `${i + 1}. ${p.name}${p.name_en ? ` (${p.name_en})` : ""}`)
    .join("\n");
  if (lang === "ko") {
    return `안녕하세요! 어떤 직무를 담당하시나요? 번호로 답장해 주세요:\n${lines}`;
  }
  return `Hi! Which position do you work in? Reply with a number:\n${lines}`;
}

export async function POST(request: NextRequest) {
  let _savedBody = "";
  let _savedFrom = "";
  let formData: FormData;
  try {
    formData = await request.formData();
    _savedBody = String(formData.get("Body") || "").trim();
    _savedFrom = normalizePhoneNumber(String(formData.get("From") || "").replace(/^whatsapp:/, ""));
  } catch {
    return twimlResponse("Could not process your message. Please try again.");
  }
  try {
    // -----------------------------------------------------------------------
    // 1. Parse Twilio webhook payload (form-encoded)
    // -----------------------------------------------------------------------
    const rawFrom = String(formData.get("From") || "");
    let body = String(formData.get("Body") || "").trim();
    const numMedia = parseInt(String(formData.get("NumMedia") || "0"), 10) || 0;
    const mediaUrl = numMedia > 0 ? String(formData.get("MediaUrl0") || "") : null;

    if (!rawFrom) {
      return twimlResponse("Missing sender.");
    }

    // WhatsApp support: strip prefix but remember the channel
    const viaWhatsApp = isWhatsAppMessage(rawFrom);
    const from = normalizePhoneNumber(viaWhatsApp ? stripWhatsAppPrefix(rawFrom) : rawFrom);

    // -----------------------------------------------------------------------
    // 2. Rate limiting
    // -----------------------------------------------------------------------
    const rateOk = checkRateLimit(`sms:${from}`, 30);
    if (!rateOk) {
      return twimlResponse("You're sending messages too quickly. Please wait a moment and try again.");
    }

    // -----------------------------------------------------------------------
    // 3. Language detection (fast Korean-aware detection first)
    // -----------------------------------------------------------------------
    const detectedLang = detectLanguageFast(body) || (await detectLanguage(body));

    // -----------------------------------------------------------------------
    // 4. Resolve worker + company
    // -----------------------------------------------------------------------
    const { data: worker } = await supabase
      .from("workers")
      .select("*, companies(*)")
      .eq("phone", from)
      .maybeSingle();

    // Unknown number → try JOIN code first, then SMS onboarding flow
    if (!worker) {
      // Handle "JOIN <CODE>" — worker joining a company
      const joinMatch = body.trim().toUpperCase().match(/^JOIN\s+(.+)$/);
      if (joinMatch) {
        const code = joinMatch[1].trim();
        const { data: company } = await supabase
          .from("companies")
          .select("id, name")
          .or(`access_code.ilike.${code},worker_join_code.ilike.${code},invite_code.ilike.${code}`)
          .maybeSingle();
        if (company) {
          // Create worker record
          const { data: newWorker } = await supabase
            .from("workers")
            .upsert({ phone: from, company_id: company.id, name: "", verified: true, status: "active" }, { onConflict: "phone" })
            .select()
            .single();
          return twimlResponse(
            `Welcome to ${company.name}! You're now registered with Sidekick. What's your name?`
          );
        } else {
          return twimlResponse("That code wasn't recognized. Please check with your manager for the correct join code.");
        }
      }

      const onboardingReply = await handleSmsOnboarding(from, body);
      if (onboardingReply) {
        return twimlResponse(onboardingReply.message || String(onboardingReply));
      }
      return twimlResponse(
        "This number isn't registered with Sidekick yet. Text JOIN followed by your company code, or reply SETUP to set up a new company."
      );
    }

    const company = worker.companies;
    const companyId: string = worker.company_id;
    const lang = resolveLang(worker.preferred_language, detectedLang);
    const languageDirective = buildLanguageDirective(lang);

    // Persist language preference if newly detected
    if (!worker.preferred_language && detectedLang) {
      await supabase.from("workers").update({ preferred_language: detectedLang }).eq("id", worker.id);
    }

    // -----------------------------------------------------------------------
    // 5. Skip position check — answer questions directly
    // -----------------------------------------------------------------------

    // -----------------------------------------------------------------------
    // SIMPLIFIED: Skip all middleware, go straight to Claude with SOP context
    // -----------------------------------------------------------------------
    {
      const { data: allSops } = await supabase
        .from("sops")
        .select("title, content, version_number")
        .eq("company_id", companyId)
        .eq("is_current", true)
        .eq("status", "active")
        .limit(10);

      const sopBlock = (allSops || [])
        .map((s: any) => `## ${s.title} (v${s.version_number})\n${s.content}`)
        .join("\n\n");

      const systemPrompt = `You are Sidekick, an AI assistant for frontline workers at ${company?.name || "Ace Bed"} (mattress manufacturing).
Answer the worker's question using the SOPs below. Be concise (under 480 chars), practical, and cite the SOP name and version.
If the SOPs don't cover the question, give your best practical answer and suggest asking a supervisor.
Respond in the same language the worker uses.

SOPs:\n${sopBlock || "(no SOPs loaded)"}`;

      const answer = await completeTextOpenAIFirst({
        system: systemPrompt,
        user: body,
        maxTokens: 450,
      });

      return twimlResponse(answer);
    }

    /* DISABLED FOR DEMO - original sections 6-12 below
    // -----------------------------------------------------------------------
    // 6. Manager training queries (must come before freeform update parser)
    // -----------------------------------------------------------------------
    const isManager = company?.manager_phone && company.manager_phone === from;
    if (isManager) {
      const trainingReply = await handleManagerTrainingQuery(companyId, body, lang);
      if (trainingReply) return twimlResponse(trainingReply);
    }

    // -----------------------------------------------------------------------
    // 6b. Manager freeform updates ("update: new mixer in kitchen 2...")
    // -----------------------------------------------------------------------
    if (shouldTreatAsManagerUpdate(body, company, from)) {
      const result = await applyManagerSmsUpdate({ companyId, company, message: body });
      await auditLog({
        companyId,
        actor: worker.id,
        action: "manager.sms_update",
        details: { summary: result.summary, applied: result.applied },
      });
      const reply =
        lang === "ko"
          ? `업데이트 완료 (${result.applied}건): ${result.summary}`
          : `Update applied (${result.applied} change${result.applied === 1 ? "" : "s"}): ${result.summary}`;
      return twimlResponse(reply);
    }

    // -----------------------------------------------------------------------
    // 7. Company runtime settings + critical incident detection
    // -----------------------------------------------------------------------
    const runtimeSettings = await getCompanyRuntimeSettings(companyId);
    const priorityProfiles = normalizeCompanyPriorityProfiles(runtimeSettings?.priority_profiles || []);

    const incident = detectCriticalIncident(body);
    if (incident) {
      const meta = getCriticalIncidentMeta(incident);
      if (company?.manager_phone && company.manager_phone !== from) {
        await twilioClient.messages.create({
          to: company.manager_phone,
          from: process.env.TWILIO_PHONE_NUMBER!,
          body: `🚨 CRITICAL (${meta.label}): ${worker.name} reported: "${body}"`,
        });
      }
      await fireWebhooks(companyId, "incident.critical", { worker_id: worker.id, message: body, incident });
      const safetyReply =
        lang === "ko"
          ? `🚨 긴급 상황이 관리자에게 전달되었습니다. ${meta.instructions_ko || meta.instructions || "안전한 곳으로 이동하세요."}`
          : `🚨 This has been escalated to your manager immediately. ${meta.instructions || "Move to a safe location."}`;
      return twimlResponse(safetyReply);
    }

    // -----------------------------------------------------------------------
    // 8. Work order completion ("done", "fixed it", "완료" etc.)
    // -----------------------------------------------------------------------
    const completionResult = await handleWorkOrderCompletion({
      companyId,
      workerId: worker.id as UUID,
      message: body,
    });
    if (completionResult?.handled) {
      // Capture what was learned fixing it
      await captureKnowledge({
        companyId,
        workerId: worker.id,
        message: body,
        context: "work_order_completion",
        workOrderId: completionResult.workOrderId,
      });
      const reply = completionResult.reply
        ? lang !== "en"
          ? await translateText(completionResult.reply, lang)
          : completionResult.reply
        : lang === "ko"
          ? "작업 완료 처리되었습니다. 수고하셨습니다! 👍"
          : "Marked complete. Nice work! 👍";
      return twimlResponse(reply);
    }

    // -----------------------------------------------------------------------
    // 9. Triage: is this an issue report that needs a work order?
    // -----------------------------------------------------------------------
    let triage: any = null;
    try {
      triage = await triageIncomingMessage({
        companyId,
        workerId: worker.id as UUID,
        message: body,
        mediaUrl,
      });
    } catch (triageErr) {
      console.error("[sms] triage failed, skipping to QA:", triageErr);
    }

    if (triage?.isIssueReport) {
      const locationId = await resolveMessageLocationId(
        companyId,
        body,
        worker.location_id || (await getPrimaryCompanyLocationId(companyId))
      );

      const priorityProfile = getPriorityProfile(priorityProfiles, triage.priority);
      const workOrder = await createWorkOrderFromTriage({
        companyId,
        reporterId: worker.id as UUID,
        triage,
        locationId,
        priorityProfile,
      });

      // Auto-assign best technician
      const technician = await findBestTechnician({
        companyId,
        asset: triage.asset as OpsAsset | null,
        requiredSkills: triage.requiredSkills || [],
        excludeWorkerId: worker.id as UUID,
      });
      if (technician && workOrder) {
        await assignWorkOrder({ workOrderId: workOrder.id, technicianId: technician.id, notify: true });
      }

      // Manager alert if settings allow
      if (
        workOrder &&
        company?.manager_phone &&
        shouldSendManagerWorkOrderAlert(runtimeSettings, triage.priority)
      ) {
        await twilioClient.messages.create({
          to: company.manager_phone,
          from: process.env.TWILIO_PHONE_NUMBER!,
          body: `New ${triage.priority} work order from ${worker.name}: ${triage.summary}`,
        });
      }

      await fireWebhooks(companyId, "work_order.created", { work_order: workOrder, triage });
      await auditLog({
        companyId,
        actor: worker.id,
        action: "work_order.created_via_sms",
        details: { work_order_id: workOrder?.id, priority: triage.priority },
      });

      const base =
        lang === "ko"
          ? `접수 완료 ✅ 작업 지시 #${workOrder?.number || ""} (${triage.priority}). ${technician ? `${technician.name}님에게 배정되었습니다.` : "담당자를 찾는 중입니다."}`
          : `Got it ✅ Work order #${workOrder?.number || ""} created (${triage.priority}). ${technician ? `Assigned to ${technician.name}.` : "Finding the right person now."}`;
      return twimlResponse(base);
    }

    // -----------------------------------------------------------------------
    // 10. Load position + SOP context (used for coaching AND Q&A below)
    // -----------------------------------------------------------------------
    const positionContext = await getWorkerPositionContext(companyId, worker.phone);
    const positionBlock = positionContext ? buildPositionPromptBlock(positionContext, lang) : "";

    const sopContext = await getSopAnswerContext({
      companyId,
      query: body,
      positionId: worker.position_id || null,
      lang,
    });

    // -----------------------------------------------------------------------
    // 11. Training coach / SOP lookup requests
    // -----------------------------------------------------------------------
    if (isTrainingCoachRequest(body) || getTrainingCoachFollowUpKind(body)) {
      const followUp = getTrainingCoachFollowUpKind(body);
      const topic = followUp ? TRAINING_COACH_FOLLOW_UP_TOPIC : TRAINING_COACH_TOPIC;
      const coachSystem = [
        languageDirective,
        positionBlock,
        sopContext?.promptBlock || "",
        `You are Sidekick, a friendly on-the-job training coach for frontline workers.
Topic mode: ${topic}. Keep responses SMS-length (under 480 characters). Be specific and practical.
Use the worker's position and SOPs above when relevant.`,
      ]
        .filter(Boolean)
        .join("\n\n");

      const coachAnswer = await completeTextOpenAIFirst({
        system: coachSystem,
        user: body,
        maxTokens: 400,
      });
      return twimlResponse(coachAnswer);
    }

    if (isSopLookupRequest(body)) {
      const sopTopic = extractSopTopic(body);
      const lookupSystem = [
        languageDirective,
        positionBlock,
        sopContext?.promptBlock || "",
        `You are Sidekick answering an SOP lookup (topic mode: ${SOP_LOOKUP_TOPIC}).
Requested topic: ${sopTopic || "unspecified"}.
Summarize the relevant procedure step-by-step from the SOP context above. If no SOP covers it, say so clearly and suggest asking a manager. Keep it under 480 characters.`,
      ]
        .filter(Boolean)
        .join("\n\n");

      const sopAnswer = await completeTextOpenAIFirst({
        system: lookupSystem,
        user: body,
        maxTokens: 400,
      });
      return twimlResponse(sopAnswer);
    }

    // -----------------------------------------------------------------------
    // 12. General Q&A over company knowledge (vector search + SOP + position)
    // -----------------------------------------------------------------------
    const queryEmbedding = await createEmbedding(body);
    const { data: knowledgeMatches } = await supabase.rpc("match_knowledge", {
      query_embedding: queryEmbedding,
      match_company_id: companyId,
      match_threshold: 0.72,
      match_count: 5,
    });

    const knowledgeBlock = (knowledgeMatches || [])
      .map((k: any, i: number) => `[${i + 1}] ${k.title}\n${k.content}`)
      .join("\n\n");

    const systemPrompt = [
      // Language directive first so the model answers in the right language
      languageDirective,
      // Position context: who this worker is and what their job involves
      positionBlock,
      // SOP context: retrieved procedure steps relevant to the question
      sopContext?.promptBlock || "",
      `You are Sidekick, an SMS assistant for frontline workers at ${company?.name || "this company"}${company?.industry ? ` (${company.industry})` : ""}.${isManager ? "\nYou are speaking with the MANAGER. Managers can ask about training status, who completed training, worker progress, and training assignments — e.g. \"Show training status\", \"Who needs training?\", \"Assign forklift training to logistics team\"." : ""}
Answer using ONLY the knowledge, SOPs, and position context provided. If the answer isn't there, say you don't have that information and suggest asking their manager.
Keep answers under 480 characters, plain text (no markdown). Prioritize safety warnings when relevant.

Company knowledge:
${knowledgeBlock || "(no relevant knowledge found)"}`,
    ]
      .filter(Boolean)
      .join("\n\n");

    let answer: string;
    if (mediaUrl) {
      answer = await completeVisionTextOpenAIFirst({
        system: systemPrompt,
        user: body || "What do you see in this image? Is anything wrong?",
        imageUrl: mediaUrl!,
        maxTokens: 450,
      });
    } else {
      answer = await completeTextOpenAIFirst({
        system: systemPrompt,
        user: body,
        maxTokens: 450,
      });
    }

    // Safety topics always get a warning suffix
    if (containsSafetyTopic(body) || containsSafetyTopic(answer)) {
      const warning =
        lang === "ko"
          ? "\n\n⚠️ 안전 관련 작업입니다. 확실하지 않으면 작업을 중단하고 관리자에게 문의하세요."
          : "\n\n⚠️ Safety-related. If unsure, stop and check with your supervisor.";
      if (!answer.includes("⚠️")) answer += warning;
    }

    // Low-confidence answers → escalate to manager
    if (isLowConfidenceAnswer(answer) && company?.manager_phone && company.manager_phone !== from) {
      await twilioClient.messages.create({
        to: company.manager_phone,
        from: process.env.TWILIO_PHONE_NUMBER!,
        body: `Sidekick couldn't answer a question from ${worker.name}: "${body.slice(0, 200)}" — you may want to follow up.`,
      });
      await auditLog({
        companyId,
        actor: worker.id,
        action: "qa.low_confidence_escalation",
        details: { question: body },
      });
    }

    // Log conversation for analytics + knowledge mining
    await supabase.from("messages").insert({
      company_id: companyId,
      worker_id: worker.id,
      direction: "inbound",
      channel: viaWhatsApp ? "whatsapp" : "sms",
      body,
      language: lang,
      media_url: mediaUrl,
    });
    await supabase.from("messages").insert({
      company_id: companyId,
      worker_id: worker.id,
      direction: "outbound",
      channel: viaWhatsApp ? "whatsapp" : "sms",
      body: answer,
      language: lang,
    });

    await fireWebhooks(companyId, "message.answered", {
      worker_id: worker.id,
      question: body,
      answer,
      language: lang,
    });

    return twimlResponse(answer);
    END OF DISABLED SECTION */
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[sms:POST] outer error:", errMsg);
    // Last-resort fallback: try simple SOP Q&A directly
    try {
      if (_savedBody && _savedFrom) {
        const { data: w } = await supabase.from("workers").select("company_id").eq("phone", _savedFrom).maybeSingle();
        if (w) {
          const sopCtx = await getSopAnswerContext({ companyId: w.company_id, query: _savedBody });
          const fallbackAnswer = await completeTextOpenAIFirst({
            system: `You are Sidekick, a helpful assistant for frontline workers. Answer using these SOPs:\n${sopCtx?.promptBlock || "(no SOPs found)"}`,
            user: _savedBody,
            maxTokens: 400,
          });
          return twimlResponse(fallbackAnswer);
        }
      }
    } catch (fallbackErr) {
      console.error("[sms:POST] fallback also failed:", String(fallbackErr));
    }
    return twimlResponse("Sorry, something went wrong. Please try again in a moment.");
  }
}
