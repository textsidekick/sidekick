import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";

/**
 * Positions API
 *
 * A "position" (직무) is a job role within a department (부서) that workers
 * are assigned to. Positions link to SOPs and training paths so Sidekick can
 * answer questions and coach workers in the context of their actual job.
 *
 * Example Korean seed data:
 *   { name: "홀 서빙",   name_en: "Hall Server",       department: "홀" }
 *   { name: "주방 보조", name_en: "Kitchen Assistant", department: "주방" }
 *   { name: "바리스타",  name_en: "Barista",           department: "음료" }
 *   { name: "지게차 기사", name_en: "Forklift Operator", department: "물류" }
 *
 * Tables:
 *   positions                (id, company_id, department_id, name, name_en,
 *                             description, required_skills text[], created_at)
 *   position_sops            (id, position_id, sop_slug, sort_order)
 *   position_training_paths  (id, position_id, training_path_id, sort_order)
 *   workers                  (id, company_id, position_id, training_completed_at, ...)
 */

// ---------------------------------------------------------------------------
// GET /api/positions?department_id=...
// Lists positions with worker counts + training completion stats.
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const departmentId = searchParams.get("department_id");

    let query = supabase
      .from("positions")
      .select(
        `
        id,
        company_id,
        department_id,
        name,
        name_en,
        description,
        required_skills,
        created_at,
        position_sops ( id, sop_slug, sort_order ),
        position_training_paths ( id, training_path_id, sort_order )
      `
      )
      .eq("company_id", companyId)
      .order("name", { ascending: true });

    if (departmentId) {
      query = query.eq("department_id", departmentId);
    }

    const { data: positions, error } = await query;
    if (error) {
      console.error("[positions:GET] query failed:", error);
      return NextResponse.json({ error: "Failed to load positions" }, { status: 500 });
    }

    // Worker counts + training completion per position (single query, grouped in JS).
    const { data: workers, error: workersError } = await supabase
      .from("workers")
      .select("id, position_id, training_completed_at")
      .eq("company_id", companyId)
      .not("position_id", "is", null);

    if (workersError) {
      console.error("[positions:GET] workers query failed:", workersError);
    }

    const statsByPosition = new Map<
      string,
      { workerCount: number; trainedCount: number }
    >();

    for (const worker of workers || []) {
      const key = worker.position_id as string;
      const entry = statsByPosition.get(key) || { workerCount: 0, trainedCount: 0 };
      entry.workerCount += 1;
      if (worker.training_completed_at) entry.trainedCount += 1;
      statsByPosition.set(key, entry);
    }

    const result = (positions || []).map((position: any) => {
      const stats = statsByPosition.get(position.id) || {
        workerCount: 0,
        trainedCount: 0,
      };
      const completionRate =
        stats.workerCount > 0
          ? Math.round((stats.trainedCount / stats.workerCount) * 100)
          : 0;

      return {
        id: position.id,
        department_id: position.department_id,
        name: position.name, // e.g. "홀 서빙"
        name_en: position.name_en, // e.g. "Hall Server"
        description: position.description,
        required_skills: position.required_skills || [],
        sop_slugs: (position.position_sops || [])
          .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((row: any) => row.sop_slug),
        training_path_ids: (position.position_training_paths || [])
          .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
          .map((row: any) => row.training_path_id),
        worker_count: stats.workerCount,
        trained_count: stats.trainedCount,
        training_completion_rate: completionRate,
        created_at: position.created_at,
      };
    });

    return NextResponse.json({ positions: result });
  } catch (err) {
    console.error("[positions:GET] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// POST /api/positions
// Body:
// {
//   "name": "주방 보조",
//   "name_en": "Kitchen Assistant",
//   "department_id": "uuid",
//   "description": "주방 위생 관리 및 재료 준비 담당",
//   "required_skills": ["위생 교육 이수", "칼 다루기"],
//   "sop_slugs": ["kitchen-opening-checklist", "knife-safety"],
//   "training_path_ids": ["uuid-1", "uuid-2"]
// }
// ---------------------------------------------------------------------------
export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const nameEn = typeof body.name_en === "string" ? body.name_en.trim() : null;
    const departmentId =
      typeof body.department_id === "string" && body.department_id
        ? body.department_id
        : null;
    const description =
      typeof body.description === "string" ? body.description.trim() : null;
    const requiredSkills = Array.isArray(body.required_skills)
      ? body.required_skills.filter((s: unknown) => typeof s === "string" && s.trim())
      : [];
    const sopSlugs = Array.isArray(body.sop_slugs)
      ? body.sop_slugs.filter((s: unknown) => typeof s === "string" && s.trim())
      : [];
    const trainingPathIds = Array.isArray(body.training_path_ids)
      ? body.training_path_ids.filter((s: unknown) => typeof s === "string" && s.trim())
      : [];

    // Duplicate name guard within the company
    const { data: existing } = await supabase
      .from("positions")
      .select("id")
      .eq("company_id", companyId)
      .eq("name", name)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: `Position "${name}" already exists` },
        { status: 409 }
      );
    }

    const { data: position, error: insertError } = await supabase
      .from("positions")
      .insert({
        company_id: companyId,
        department_id: departmentId,
        name,
        name_en: nameEn,
        description,
        required_skills: requiredSkills,
      })
      .select()
      .single();

    if (insertError || !position) {
      console.error("[positions:POST] insert failed:", insertError);
      return NextResponse.json({ error: "Failed to create position" }, { status: 500 });
    }

    // Associate SOPs (by slug)
    if (sopSlugs.length) {
      const sopRows = sopSlugs.map((slug: string, index: number) => ({
        position_id: position.id,
        sop_slug: slug.trim(),
        sort_order: index,
      }));
      const { error: sopError } = await supabase.from("position_sops").insert(sopRows);
      if (sopError) {
        console.error("[positions:POST] position_sops insert failed:", sopError);
      }
    }

    // Associate training paths (by id)
    if (trainingPathIds.length) {
      const pathRows = trainingPathIds.map((id: string, index: number) => ({
        position_id: position.id,
        training_path_id: id,
        sort_order: index,
      }));
      const { error: pathError } = await supabase
        .from("position_training_paths")
        .insert(pathRows);
      if (pathError) {
        console.error(
          "[positions:POST] position_training_paths insert failed:",
          pathError
        );
      }
    }

    return NextResponse.json(
      {
        position: {
          ...position,
          sop_slugs: sopSlugs,
          training_path_ids: trainingPathIds,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("[positions:POST] unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
