import { supabase } from "@/lib/supabase";

export type Term = {
  id: string;
  term: string;
  synonyms: string[];
  definition: string;
  language: string;
};

const cache = new Map<string, { terms: Term[]; at: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function getCompanyTerms(companyId: string): Promise<Term[]> {
  const hit = cache.get(companyId);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.terms;

  const { data } = await supabase
    .from("terminology")
    .select("id, term, synonyms, definition, language")
    .eq("company_id", companyId);

  const terms = (data || []) as Term[];
  cache.set(companyId, { terms, at: Date.now() });
  return terms;
}

/**
 * Expand a worker's query with canonical terms so factory lingo
 * ("본딩기" ↔ "접착기" ↔ "bonding machine") matches SOPs/knowledge
 * regardless of which word was used.
 */
export async function expandQuery(companyId: string, query: string): Promise<{
  expandedQuery: string;
  matchedTerms: Term[];
}> {
  const terms = await getCompanyTerms(companyId);
  const lower = query.toLowerCase();
  const matched: Term[] = [];
  const additions = new Set<string>();

  for (const t of terms) {
    const candidates = [t.term, ...(t.synonyms || [])];
    const found = candidates.some((c) => c && lower.includes(c.toLowerCase()));
    if (found) {
      matched.push(t);
      for (const c of candidates) {
        if (!lower.includes(c.toLowerCase())) additions.add(c);
      }
    }
  }

  const expandedQuery = additions.size > 0 ? `${query} ${[...additions].join(" ")}` : query;
  return { expandedQuery, matchedTerms: matched };
}

/**
 * Glossary block for the LLM system prompt so answers use the
 * company's own vocabulary (Korean lingo included).
 */
export function buildGlossaryPrompt(matchedTerms: Term[]): string {
  if (!matchedTerms.length) return "";
  const lines = matchedTerms.map(
    (t) =>
      `- "${t.term}" (also: ${(t.synonyms || []).join(", ") || "—"})${t.definition ? `: ${t.definition}` : ""}`
  );
  return `Company terminology (use these exact terms in your answer):\n${lines.join("\n")}`;
}
