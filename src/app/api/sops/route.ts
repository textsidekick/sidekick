import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";

function slugify(title: string) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
  return base || `sop-${Date.now()}`;
}

// GET /api/sops?status=active&departmentId=...&currentOnly=1&q=...
export async function GET(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const departmentId = searchParams.get("departmentId");
  const currentOnly = searchParams.get("currentOnly") !== "0";
  const q = searchParams.get("q");

  let query = supabase
    .from("sops")
    .select("*")
    .eq("company_id", companyId)
    .order("updated_at", { ascending: false });

  if (currentOnly) query = query.eq("is_current", true);
  if (status) query = query.eq("status", status);
  if (departmentId && departmentId !== "all") query = query.eq("department_id", departmentId);
  if (q) query = query.textSearch("search_tsv", q, { type: "plain", config: "simple" });

  const { data, error } = await query;
  if (error) {
    console.error("SOP list error:", error);
    return NextResponse.json({ error: "Failed to fetch SOPs" }, { status: 500 });
  }
  return NextResponse.json({ sops: data || [] });
}

// POST /api/sops — create a new SOP (version 1, draft)
export async function POST(request: NextRequest) {
  const _rl = checkRateLimit(rateLimitKey("api", request as any), 30);
  if (!_rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const companyId = await getCompanyId(request);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, description = "", content, category = "", department_id = null,
          tags = [], language = "ko", created_by = "" } = body || {};

  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "title and content are required" }, { status: 400 });
  }

  // Ensure unique slug per company
  let slug = slugify(title);
  const { data: existing } = await supabase
    .from("sops")
    .select("id")
    .eq("company_id", companyId)
    .eq("slug", slug)
    .limit(1);
  if (existing?.length) slug = `${slug}-${Date.now().toString(36)}`;

  const { data, error } = await supabase
    .from("sops")
    .insert({
      company_id: companyId,
      slug,
      title: title.trim(),
      description,
      content,
      category,
      department_id,
      tags,
      language,
      created_by,
      version_number: 1,
      is_current: true,
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    console.error("SOP create error:", error);
    return NextResponse.json({ error: "Failed to create SOP" }, { status: 500 });
  }

  await supabase.from("knowledge_events").insert({
    company_id: companyId,
    source_type: "sop",
    source_id: data.id,
    event: "contribution",
    worker_phone: created_by || null,
    department_id,
  });

  return NextResponse.json({ sop: data }, { status: 201 });
}
