import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";
import { normalizePhoneNumber } from "@/lib/phone";
import { auditLog } from "@/lib/audit";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are Sidekick's manager update parser.
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
  "assets": [
    {
      "name": "required when asset is mentioned",
      "asset_tag": "optional",
      "location": "optional",
      "type": "optional",
      "notes": "optional"
    }
  ],
  "team": [
    {
      "name": "optional",
      "phone": "optional",
      "role": "operator|technician|supervisor|manager"
    }
  ],
  "knowledge": [
    {
      "title": "required when a reusable procedure/tip is present",
      "problem": "optional",
      "solution": "required",
      "asset_name": "optional",
      "equipment_type": "optional",
      "tags": ["optional", "tags"]
    }
  ],
  "notes": ["short notes that should be preserved but are not direct structured writes"]
}

Rules:
- Be conservative. Do not invent people, phones, assets, or procedures.
- If a phone number is missing, leave it blank rather than guessing.
- Only create knowledge entries when the manager shared a reusable instruction, SOP, or troubleshooting tip.
- notes should be short factual leftovers.
- If nothing is structured, return empty objects/arrays with a useful summary.`;

type ParsedUpdate = {
  summary?: string;
  company?: {
    name?: string;
    industry?: string;
    manager_name?: string;
    manager_phone?: string;
    worker_count?: number | string | null;
  };
  assets?: Array<{
    name?: string;
    asset_tag?: string;
    location?: string;
    type?: string;
    notes?: string;
  }>;
  team?: Array<{
    name?: string;
    phone?: string;
    role?: string;
  }>;
  knowledge?: Array<{
    title?: string;
    problem?: string;
    solution?: string;
    asset_name?: string;
    equipment_type?: string;
    tags?: string[];
  }>;
  notes?: string[];
};

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function safeJsonParse(text: string): ParsedUpdate | null {
  try {
    return JSON.parse(text) as ParsedUpdate;
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as ParsedUpdate;
    } catch {
      return null;
    }
  }
}

function makeAssetTag(name: string, index: number) {
  const slug = name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 18) || "ASSET";
  return `${slug}-${String(index + 1).padStart(2, "0")}`;
}

function summarizeChanges(changes: Record<string, unknown>, fallback: string | null) {
  const parts: string[] = [];
  if (changes.companyUpdated) parts.push("updated company details");
  const assetsCreated = Number(changes.assetsCreated || 0);
  const assetsUpdated = Number(changes.assetsUpdated || 0);
  const teamSynced = Number(changes.teamSynced || 0);
  const knowledgeAdded = Number(changes.knowledgeAdded || 0);
  if (assetsCreated) parts.push(`added ${assetsCreated} asset${assetsCreated === 1 ? "" : "s"}`);
  if (assetsUpdated) parts.push(`updated ${assetsUpdated} asset${assetsUpdated === 1 ? "" : "s"}`);
  if (teamSynced) parts.push(`synced ${teamSynced} team member${teamSynced === 1 ? "" : "s"}`);
  if (knowledgeAdded) parts.push(`saved ${knowledgeAdded} knowledge entr${knowledgeAdded === 1 ? "y" : "ies"}`);

  if (parts.length === 0) {
    return fallback || "Got it — I saved the update context.";
  }

  return `Got it — I ${parts.join(", ")}.`;
}

export async function GET(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("company_updates")
    .select("id,message,assistant_response,summary,applied_changes,created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ updates: data || [] });
}

export async function POST(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const preflight = await supabase.from("company_updates").select("id").limit(1);
  if (preflight.error) {
    return NextResponse.json({ error: preflight.error.message }, { status: 500 });
  }

  let body: { message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const message = cleanString(body.message);
  if (!message) return NextResponse.json({ error: "message required" }, { status: 400 });

  const startedAt = Date.now();

  const { data: company } = await supabase
    .from("companies")
    .select("id,name,industry,manager_name,manager_phone,worker_count")
    .eq("id", companyId)
    .single();

  let parsed: ParsedUpdate | null = null;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      temperature: 0.1,
      max_tokens: 900,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Current company context:\n${JSON.stringify(company || {}, null, 2)}\n\nManager update:\n${message}`,
        },
      ],
    });
    parsed = safeJsonParse(response.choices[0]?.message?.content || "");
  } catch (error) {
    console.error("[company-updates][parse]", error);
  }

  if (!parsed) {
    parsed = { summary: "Saved manager update for follow-up review.", notes: [message] };
  }

  const changes: Record<string, unknown> = {
    companyUpdated: false,
    assetsCreated: 0,
    assetsUpdated: 0,
    teamSynced: 0,
    knowledgeAdded: 0,
    notes: parsed.notes || [],
  };

  const companyPatch: Record<string, unknown> = {};
  const nextName = cleanString(parsed.company?.name);
  const nextIndustry = cleanString(parsed.company?.industry);
  const nextManagerName = cleanString(parsed.company?.manager_name);
  const nextManagerPhoneRaw = cleanString(parsed.company?.manager_phone);
  const nextWorkerCount = parsed.company?.worker_count;

  if (nextName) companyPatch.name = nextName;
  if (nextIndustry) companyPatch.industry = nextIndustry;
  if (nextManagerName) companyPatch.manager_name = nextManagerName;
  if (nextManagerPhoneRaw) {
    try {
      companyPatch.manager_phone = normalizePhoneNumber(nextManagerPhoneRaw);
    } catch {
      companyPatch.manager_phone = nextManagerPhoneRaw;
    }
  }
  if (nextWorkerCount !== undefined && nextWorkerCount !== null && `${nextWorkerCount}`.trim() !== "") {
    const numeric = Number(nextWorkerCount);
    if (Number.isFinite(numeric)) companyPatch.worker_count = numeric;
  }

  if (Object.keys(companyPatch).length > 0) {
    const { error } = await supabase.from("companies").update(companyPatch).eq("id", companyId);
    if (!error) changes.companyUpdated = true;
  }

  for (const [index, rawAsset] of (parsed.assets || []).entries()) {
    const name = cleanString(rawAsset.name);
    if (!name) continue;

    const { data: existingAsset } = await supabase
      .from("assets")
      .select("id,asset_tag,metadata")
      .eq("company_id", companyId)
      .ilike("name", name)
      .limit(1)
      .maybeSingle();

    const payload: Record<string, unknown> = {
      name,
      type: cleanString(rawAsset.type) || "equipment",
      location: cleanString(rawAsset.location) || "Unassigned",
      notes: cleanString(rawAsset.notes),
      metadata: {
        added_via: "updates_chat",
        added_at: new Date().toISOString(),
      },
    };

    if (existingAsset?.id) {
      const mergedMeta = {
        ...((existingAsset.metadata as Record<string, unknown> | null) || {}),
        ...(payload.metadata as Record<string, unknown>),
      };
      const { error } = await supabase
        .from("assets")
        .update({ ...payload, metadata: mergedMeta })
        .eq("id", existingAsset.id);
      if (!error) changes.assetsUpdated = Number(changes.assetsUpdated) + 1;
      continue;
    }

    const insertPayload = {
      company_id: companyId,
      name,
      asset_tag: cleanString(rawAsset.asset_tag) || makeAssetTag(name, index),
      type: payload.type,
      location: payload.location,
      notes: payload.notes,
      status: "active",
      health_score: 100,
      metadata: payload.metadata,
    };

    const { error } = await supabase.from("assets").insert(insertPayload as any);
    if (!error) changes.assetsCreated = Number(changes.assetsCreated) + 1;
  }

  const teamRows = (parsed.team || [])
    .map((member) => {
      const phoneRaw = cleanString(member.phone);
      if (!phoneRaw) return null;
      let phone = phoneRaw;
      try {
        phone = normalizePhoneNumber(phoneRaw);
      } catch {}
      return {
        company_id: companyId,
        name: cleanString(member.name),
        phone,
        role: cleanString(member.role) || "operator",
        verified: true,
      };
    })
    .filter(Boolean);

  if (teamRows.length > 0) {
    const { data, error } = await supabase
      .from("workers")
      .upsert(teamRows as any[], { onConflict: "phone" })
      .select("id");
    if (!error) changes.teamSynced = data?.length || teamRows.length;
  }

  for (const rawKnowledge of parsed.knowledge || []) {
    const solution = cleanString(rawKnowledge.solution);
    const title = cleanString(rawKnowledge.title) || cleanString(rawKnowledge.problem) || "Operational note";
    if (!solution) continue;

    const now = new Date().toISOString();
    const tags = Array.isArray(rawKnowledge.tags)
      ? rawKnowledge.tags.map((tag) => cleanString(tag)).filter(Boolean)
      : [];

    const { error } = await supabase.from("knowledge_articles").insert({
      company_id: companyId,
      title,
      problem: cleanString(rawKnowledge.problem) || title,
      solution,
      asset_name: cleanString(rawKnowledge.asset_name),
      equipment_type: cleanString(rawKnowledge.equipment_type),
      parts_used: [],
      tags,
      metadata: {
        source: "updates_chat",
        review_status: "verified",
        verified_by: cleanString(parsed.company?.manager_name) || company?.manager_name || "Manager",
        verified_at: now,
      },
    } as any);

    if (!error) changes.knowledgeAdded = Number(changes.knowledgeAdded) + 1;
  }

  const assistantResponse = summarizeChanges(changes, cleanString(parsed.summary));

  const updateInsert = {
    company_id: companyId,
    author_name: cleanString(parsed.company?.manager_name) || company?.manager_name || "Manager",
    source: "dashboard",
    message,
    assistant_response: assistantResponse,
    summary: cleanString(parsed.summary),
    applied_changes: changes,
  };

  const { data: update, error: updateError } = await supabase
    .from("company_updates")
    .insert(updateInsert)
    .select("id,message,assistant_response,summary,applied_changes,created_at")
    .single();

  if (updateError) {
    console.error("[company-updates][insert]", updateError);
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  await auditLog({
    companyId,
    action: "company.update_submitted",
    entityType: "company_update",
    entityId: update.id,
    details: {
      responseTimeMs: Date.now() - startedAt,
      changes,
    },
  });

  return NextResponse.json({
    ok: true,
    assistantMessage: assistantResponse,
    update,
  });
}
