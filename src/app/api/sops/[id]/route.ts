import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";

type Params = { params: Promise<{ id: string }> };

// GET /api/sops/[id] — detail + full version history
export async function GET(request: NextRequest, { params }: Params) {
  const companyId = await getCompanyId(request);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const { data: sop, error } = await supabase
    .from("sops")
    .select("*")
    .eq("id", id)
    .eq("company_id", companyId)
    .single();
  if (error || !sop) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: versions } = await supabase
    .from("sops")
    .select("id, version_number, status, is_current, change_summary, created_by, approved_by, approved_at, created_at")
    .eq("company_id", companyId)
    .eq("slug", sop.slug)
    .order("version_number", { ascending: false });

  return NextResponse.json({ sop, versions: versions || [] });
}

// PATCH /api/sops/[id] — lifecycle actions: approve | deprecate | update_meta
export async function PATCH(request: NextRequest, { params }: Params) {
  const companyId = await getCompanyId(request);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();
  const action = body?.action as string;

  const { data: sop } = await supabase
    .from("sops")
    .select("*")
    .eq("id", id)
    .eq("company_id", companyId)
    .single();
  if (!sop) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "approve") {
    if (!sop.is_current) {
      return NextResponse.json({ error: "Only the current version can be approved" }, { status: 400 });
    }
    // Approving the current draft deprecates all prior active versions
    await supabase
      .from("sops")
      .update({ status: "deprecated", updated_at: new Date().toISOString() })
      .eq("company_id", companyId)
      .eq("slug", sop.slug)
      .neq("id", id)
      .eq("status", "active");

    const { data, error } = await supabase
      .from("sops")
      .update({
        status: "active",
        approved_by: body.approved_by || "",
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: "Approve failed" }, { status: 500 });
    return NextResponse.json({ sop: data });
  }

  if (action === "deprecate") {
    const { data, error } = await supabase
      .from("sops")
      .update({ status: "deprecated", updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: "Deprecate failed" }, { status: 500 });
    return NextResponse.json({ sop: data });
  }

  if (action === "update_meta") {
    const allowed: Record<string, unknown> = {};
    for (const key of ["title", "description", "category", "department_id", "tags", "language"]) {
      if (key in body) allowed[key] = body[key];
    }
    allowed.updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from("sops")
      .update(allowed)
      .eq("id", id)
      .select()
      .single();
    if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
    return NextResponse.json({ sop: data });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

// POST /api/sops/[id] — create new version from this SOP
export async function POST(request: NextRequest, { params }: Params) {
  const companyId = await getCompanyId(request);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await request.json();

  if (!body?.content?.trim()) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  // Ownership check before calling the SQL function
  const { data: sop } = await supabase
    .from("sops")
    .select("id, department_id")
    .eq("id", id)
    .eq("company_id", companyId)
    .single();
  if (!sop) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data, error } = await supabase.rpc("create_sop_version", {
    p_sop_id: id,
    p_content: body.content,
    p_title: body.title || "",
    p_description: body.description || "",
    p_change_summary: body.change_summary || "",
    p_created_by: body.created_by || "",
  });

  if (error) {
    console.error("Version create error:", error);
    return NextResponse.json({ error: "Failed to create version" }, { status: 500 });
  }

  await supabase.from("knowledge_events").insert({
    company_id: companyId,
    source_type: "sop",
    source_id: (data as any).id,
    event: "contribution",
    department_id: sop.department_id,
  });

  return NextResponse.json({ sop: data }, { status: 201 });
}
