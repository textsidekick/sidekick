import { supabase } from "@/lib/supabase";
import { expandQuery, buildGlossaryPrompt } from "@/lib/terminology";

export type SopMatch = {
  id: string;
  slug: string;
  title: string;
  content: string;
  version_number: number;
  approved_at: string | null;
  department_id: string | null;
  language: string;
};

/**
 * SOP-first retrieval for the SMS answer pipeline.
 *
 * Rules for Ace Bed:
 *  - Only CURRENT + ACTIVE SOP versions are ever surfaced.
 *  - SOPs outrank tribal knowledge (they are the approved procedure).
 *  - Answers cite the SOP title and version so workers know which
 *    revision they're following.
 *
 * Usage in the SMS webhook (before building the LLM prompt):
 *
 *   const ctx = await getSopAnswerContext(companyId, incomingMessage);
 *   if (ctx.promptBlock) systemPrompt += "\n\n" + ctx.promptBlock;
 */
export async function getSopAnswerContext(args: {
  companyId: string;
  query: string;
  positionId?: string | null;
  lang?: string;
  workerPhone?: string;
  limit?: number;
})
export async function getSopAnswerContext(companyId: string, query: string, opts?: { workerPhone?: string; limit?: number; })
export async function getSopAnswerContext(
  argsOrCompanyId: string | { companyId: string; query: string; positionId?: string | null; lang?: string; workerPhone?: string; limit?: number },
  query?: string,
  opts?: { workerPhone?: string; limit?: number }
) {
  let companyId: string;
  let resolvedQuery: string;
  let resolvedOpts: { workerPhone?: string; limit?: number } | undefined;
  if (typeof argsOrCompanyId === "object") {
    companyId = argsOrCompanyId.companyId;
    resolvedQuery = argsOrCompanyId.query;
    resolvedOpts = { workerPhone: argsOrCompanyId.workerPhone, limit: argsOrCompanyId.limit };
  } else {
    companyId = argsOrCompanyId;
    resolvedQuery = query!;
    resolvedOpts = opts;
  }
  const { expandedQuery, matchedTerms } = await expandQuery(companyId, resolvedQuery);

  let { data, error } = await supabase
    .from("sops")
    .select("id, slug, title, content, version_number, approved_at, department_id, language")
    .eq("company_id", companyId)
    .eq("is_current", true)
    .eq("status", "active")
    .textSearch("search_tsv", expandedQuery, { type: "websearch", config: "simple" })
    .limit(resolvedOpts?.limit ?? 3);

  if (error) {
    console.error("SOP retrieval error:", error);
  }

  // Fallback: if no results from full-text search, try ilike on title + content
  if (!data || data.length === 0) {
    const keywords = resolvedQuery.split(/\s+/).filter(w => w.length > 2).slice(0, 4);
    let fallbackQuery = supabase
      .from("sops")
      .select("id, slug, title, content, version_number, approved_at, department_id, language")
      .eq("company_id", companyId)
      .eq("is_current", true)
      .eq("status", "active");
    // Try matching any keyword in title or content
    if (keywords.length > 0) {
      const orClauses = keywords.map(k => `title.ilike.%${k}%,content.ilike.%${k}%`).join(',');
      fallbackQuery = fallbackQuery.or(orClauses);
    }
    const fallback = await fallbackQuery.limit(resolvedOpts?.limit ?? 3);
    if (fallback.data && fallback.data.length > 0) {
      data = fallback.data;
    }
  }

  // Last resort: return all SOPs so the AI has context
  if (!data || data.length === 0) {
    const allSops = await supabase
      .from("sops")
      .select("id, slug, title, content, version_number, approved_at, department_id, language")
      .eq("company_id", companyId)
      .eq("is_current", true)
      .eq("status", "active")
      .limit(5);
    data = allSops.data || [];
  }

  const sops = (data || []) as SopMatch[];

  // Log usage — feeds KM metrics ("which SOPs actually get used")
  if (sops.length > 0) {
    await supabase.from("knowledge_events").insert(
      sops.map((s) => ({
        company_id: companyId,
        source_type: "sop",
        source_id: s.id,
        event: "sms_answer",
        worker_phone: resolvedOpts?.workerPhone || null,
        department_id: s.department_id,
      }))
    );
  }

  const glossary = buildGlossaryPrompt(matchedTerms);
  const sopBlock = sops.length
    ? [
        "OFFICIAL STANDARD OPERATING PROCEDURES (these override any other knowledge; always cite the SOP name and version, e.g. “매트리스 봉제 SOP v3 기준”):",
        ...sops.map(
          (s) =>
            `--- ${s.title} (v${s.version_number}, approved ${s.approved_at?.slice(0, 10) || "n/a"}) ---\n${s.content.slice(0, 4000)}`
        ),
      ].join("\n\n")
    : "";

  const promptBlock = [glossary, sopBlock].filter(Boolean).join("\n\n");
  return { sops, promptBlock, matchedTerms };
}
