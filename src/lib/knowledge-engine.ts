import { supabase } from "@/lib/supabase";
import { completeJsonOpenAIFirst } from "@/lib/sms-ai";

// ============================================
// Auto-capture knowledge from completed work orders
// ============================================
export async function captureKnowledge(
  argsOrWorkOrderId:
    | string
    | { companyId: string; workerId: string; message: string; context?: string; workOrderId?: string }
): Promise<string | null> {
  // Accept either a plain workOrderId string or an object from the SMS pipeline
  const workOrderId =
    typeof argsOrWorkOrderId === "string"
      ? argsOrWorkOrderId
      : argsOrWorkOrderId.workOrderId || null;

  if (!workOrderId) return null;

  const { data: wo } = await supabase
    .from("work_orders")
    .select("*")
    .eq("id", workOrderId)
    .single();

  if (!wo || wo.status !== "completed" || !wo.resolution_notes) return null;

  // Don't duplicate
  const { data: existing } = await supabase
    .from("knowledge_articles")
    .select("id")
    .eq("source_work_order_id", workOrderId)
    .limit(1);

  if (existing && existing.length > 0) return existing[0].id;

  // Get asset info if available
  let asset: any = null;
  if (wo.asset_id) {
    const { data: a } = await supabase.from("assets").select("*").eq("id", wo.asset_id).single();
    asset = a;
  }

  // Use OpenAI first, Anthropic fallback via the shared SMS AI helper.
  const text = await completeJsonOpenAIFirst({
    maxTokens: 600,
    user: `Generate a reusable knowledge article from this completed work order. This article will help future technicians solve similar problems.

Work Order:
- Title: ${wo.title}
- Description: ${wo.description || "N/A"}
- Category: ${wo.category}
- Priority: ${wo.priority}
- Resolution: ${wo.resolution_notes}
- Time spent: ${wo.actual_time_minutes || "unknown"} minutes
- Parts used: ${JSON.stringify(wo.parts_used || [])}
${asset ? `- Machine: ${asset.name} (${asset.type || ""}, ${asset.manufacturer || ""} ${asset.model || ""})` : ""}

Return JSON:
{
  "title": "Clear, searchable title for this knowledge article",
  "problem": "What was the problem (1-2 sentences)",
  "symptoms": "What symptoms indicated this problem",
  "solution": "Step-by-step what was done to fix it",
  "parts_used": ["part1", "part2"],
  "time_estimate_minutes": <number>,
  "tags": ["tag1", "tag2", "tag3"]
}

JSON only.`,
  });
  let article: any = {};

  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) article = JSON.parse(match[0]);
  } catch { /* use defaults */ }

  const { data: inserted, error } = await supabase.from("knowledge_articles").insert({
    company_id: wo.company_id,
    asset_id: wo.asset_id || null,
    asset_name: wo.asset_name || asset?.name || null,
    equipment_type: asset?.type || null,
    title: article.title || wo.title,
    problem: article.problem || wo.description || wo.title,
    symptoms: article.symptoms || null,
    solution: article.solution || wo.resolution_notes,
    parts_used: article.parts_used || wo.parts_used || [],
    time_estimate_minutes: article.time_estimate_minutes || wo.actual_time_minutes || null,
    tags: article.tags || [wo.category],
    source_work_order_id: workOrderId,
  }).select("id").single();

  if (error) {
    console.error("[knowledge-engine] Failed to insert article:", error.message);
    return null;
  }

  return inserted?.id || null;
}

// ============================================
// Search knowledge base
// ============================================
export async function searchKnowledge(query: string, companyId: string, limit = 10): Promise<any[]> {
  // Search knowledge_articles using text matching
  const searchTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
  
  if (searchTerms.length === 0) {
    const { data } = await supabase
      .from("knowledge_articles")
      .select("*")
      .eq("company_id", companyId)
      .order("times_referenced", { ascending: false })
      .limit(limit);
    return data || [];
  }

  // Use ilike for simple text search across multiple fields
  const { data: articles } = await supabase
    .from("knowledge_articles")
    .select("*")
    .eq("company_id", companyId)
    .or(searchTerms.map(t => `title.ilike.%${t}%,problem.ilike.%${t}%,symptoms.ilike.%${t}%,solution.ilike.%${t}%,tags.cs.{${t}}`).join(","))
    .order("times_referenced", { ascending: false })
    .limit(limit);

  // Also search existing document chunks (existing RAG pipeline)
  // We'll return knowledge articles first, then doc results
  return articles || [];
}

// ============================================
// Get all knowledge for a specific asset
// ============================================
export async function getAssetKnowledge(assetId: string): Promise<any[]> {
  const { data } = await supabase
    .from("knowledge_articles")
    .select("*")
    .eq("asset_id", assetId)
    .order("created_at", { ascending: false });
  return data || [];
}

// ============================================
// Increment reference count when article is used
// ============================================
export async function markArticleReferenced(articleId: string): Promise<void> {
  try {
    const { data } = await supabase
      .from("knowledge_articles")
      .select("times_referenced")
      .eq("id", articleId)
      .single();
    if (data) {
      await supabase
        .from("knowledge_articles")
        .update({ times_referenced: ((data as any).times_referenced || 0) + 1 })
        .eq("id", articleId);
    }
  } catch (e) {
    console.error("[knowledge] Failed to increment reference:", e);
  }
}
