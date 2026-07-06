import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { auditLog } from "@/lib/audit";

/**
 * GET  — fetch items needing review, sorted by risk (no asset = higher risk) then age (oldest first)
 * POST — perform review actions: verify, reject, snooze, edit_verify
 */

async function knowledgeMetadataAvailable() {
  const probe = await supabase.from("knowledge_articles").select("id,metadata").limit(1);
  return !probe.error;
}

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("companyId");
  if (!companyId) {
    const token = request.cookies.get("sidekick_session")?.value;
    if (!token) return NextResponse.json({ error: "auth required" }, { status: 401 });
    const { data: session } = await supabase.from("manager_sessions").select("company_id").eq("token", token).single();
    if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    return fetchReviewQueue(session.company_id);
  }
  return fetchReviewQueue(companyId);
}

async function fetchReviewQueue(companyId: string) {
  const schemaReady = await knowledgeMetadataAvailable();

  // Fetch articles that need review — those with source_work_order_id and not yet verified
  const { data: articles, error } = await supabase
    .from("knowledge_articles")
    .select("*")
    .eq("company_id", companyId)
    .not("source_work_order_id", "is", null)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Filter: only items that haven't been verified/rejected (check metadata)
  const pending = (articles || []).filter(a => {
    const meta = (a as any).metadata || {};
    return meta.review_status !== "verified" && meta.review_status !== "rejected";
  });

  // Sort: items without asset link (higher risk) first, then by age
  pending.sort((a: any, b: any) => {
    const aRisk = a.asset_name ? 0 : 1;
    const bRisk = b.asset_name ? 0 : 1;
    if (aRisk !== bRisk) return bRisk - aRisk; // higher risk first
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  return NextResponse.json({ items: pending, schemaReady });
}

export async function POST(request: NextRequest) {
  if (!(await knowledgeMetadataAvailable())) {
    return NextResponse.json({ error: "knowledge review schema is not applied yet" }, { status: 503 });
  }

  const body = await request.json();
  const { articleId, action, reason, snoozeDuration, edits, reviewerName, companyId } = body;

  if (!articleId || !action) {
    return NextResponse.json({ error: "articleId and action required" }, { status: 400 });
  }

  const now = new Date().toISOString();

  if (action === "verify") {
    // Mark as verified in metadata
    const { data: article } = await supabase.from("knowledge_articles").select("metadata").eq("id", articleId).single();
    const meta = { ...((article as any)?.metadata || {}), review_status: "verified", verified_by: reviewerName || "Manager", verified_at: now };
    await supabase.from("knowledge_articles").update({ metadata: meta }).eq("id", articleId);
    await auditLog({ companyId, action: "knowledge.verify", entityType: "knowledge_article", entityId: articleId, details: { reviewerName } });
    return NextResponse.json({ ok: true });
  }

  if (action === "reject") {
    const { data: article } = await supabase.from("knowledge_articles").select("metadata").eq("id", articleId).single();
    const meta = { ...((article as any)?.metadata || {}), review_status: "rejected", rejected_by: reviewerName || "Manager", rejected_at: now, reject_reason: reason || "" };
    await supabase.from("knowledge_articles").update({ metadata: meta }).eq("id", articleId);
    await auditLog({ companyId, action: "knowledge.reject", entityType: "knowledge_article", entityId: articleId, details: { reason, reviewerName } });
    return NextResponse.json({ ok: true });
  }

  if (action === "snooze") {
    const { data: article } = await supabase.from("knowledge_articles").select("metadata").eq("id", articleId).single();
    const snoozeUntil = new Date(Date.now() + (snoozeDuration || 7) * 86400000).toISOString();
    const meta = { ...((article as any)?.metadata || {}), review_status: "snoozed", snoozed_until: snoozeUntil };
    await supabase.from("knowledge_articles").update({ metadata: meta }).eq("id", articleId);
    await auditLog({ companyId, action: "knowledge.snooze", entityType: "knowledge_article", entityId: articleId, details: { snoozeDuration, snoozeUntil } });
    return NextResponse.json({ ok: true });
  }

  if (action === "edit_verify") {
    const { data: article } = await supabase.from("knowledge_articles").select("metadata").eq("id", articleId).single();
    const meta = { ...((article as any)?.metadata || {}), review_status: "verified", verified_by: reviewerName || "Manager", verified_at: now, last_edited_by: reviewerName || "Manager", last_edited_at: now };
    const updatePayload: Record<string, unknown> = { metadata: meta };
    if (edits?.title) updatePayload.title = edits.title;
    if (edits?.solution) updatePayload.solution = edits.solution;
    if (edits?.problem) updatePayload.problem = edits.problem;
    if (edits?.symptoms) updatePayload.symptoms = edits.symptoms;
    await supabase.from("knowledge_articles").update(updatePayload).eq("id", articleId);
    await auditLog({ companyId, action: "knowledge.edit_verify", entityType: "knowledge_article", entityId: articleId, details: { edits, reviewerName } });
    return NextResponse.json({ ok: true });
  }

  // Bulk verify (low-risk only — items with asset linkage)
  if (action === "bulk_verify") {
    const { articleIds } = body;
    if (!articleIds?.length) return NextResponse.json({ error: "articleIds required" }, { status: 400 });
    for (const id of articleIds) {
      const { data: article } = await supabase.from("knowledge_articles").select("metadata").eq("id", id).single();
      const meta = { ...((article as any)?.metadata || {}), review_status: "verified", verified_by: reviewerName || "Manager", verified_at: now };
      await supabase.from("knowledge_articles").update({ metadata: meta }).eq("id", id);
    }
    await auditLog({ companyId, action: "knowledge.bulk_verify", entityType: "knowledge_article", details: { count: articleIds.length, reviewerName } });
    return NextResponse.json({ ok: true, count: articleIds.length });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
