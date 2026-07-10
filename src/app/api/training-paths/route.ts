import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { requireDashboardAuth } from "@/lib/dashboard-auth";

// GET /api/training-paths?companyId=...
export async function GET(req: NextRequest) {
  const auth = await requireDashboardAuth(req);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId") || auth.companyId;

  const { data: paths, error } = await supabase
    .from("training_paths")
    .select(`
      id, name, description, role, estimated_days, is_active, department_id, created_at,
      training_steps(id, sort_order, title, estimated_minutes)
    `)
    .eq("company_id", companyId)
    .order("name");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Attach enrollment counts
  const pathIds = (paths || []).map((p) => p.id);
  const { data: progress } = await supabase
    .from("training_enrollments")
    .select("training_path_id, status")
    .in("training_path_id", pathIds.length ? pathIds : ["00000000-0000-0000-0000-000000000000"]);

  const countsByPath: Record<string, { total: number; completed: number; in_progress: number }> = {};
  for (const row of progress || []) {
    if (!countsByPath[row.training_path_id]) {
      countsByPath[row.training_path_id] = { total: 0, completed: 0, in_progress: 0 };
    }
    countsByPath[row.training_path_id].total++;
    if (row.status === "completed") countsByPath[row.training_path_id].completed++;
    if (row.status === "in_progress" || row.status === "active") countsByPath[row.training_path_id].in_progress++;
  }

  const result = (paths || []).map((p) => ({
    ...p,
    step_count: (p.training_steps || []).length,
    enrollment: countsByPath[p.id] || { total: 0, completed: 0, in_progress: 0 },
  }));

  return NextResponse.json({ paths: result });
}

// POST /api/training-paths
export async function POST(req: NextRequest) {
  const auth = await requireDashboardAuth(req);
  if (!auth.ok) return auth.response;

  const body = await req.json();
  const { companyId, name, description, role, estimated_days = 5, department_id, steps = [] } = body;

  const resolvedCompanyId = companyId || auth.companyId;
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const { data: path, error: pathError } = await supabase
    .from("training_paths")
    .insert({ company_id: resolvedCompanyId, name, description, role, estimated_days, department_id })
    .select()
    .single();

  if (pathError) return NextResponse.json({ error: pathError.message }, { status: 500 });

  // Insert steps if provided
  if (steps.length > 0) {
    const stepRows = steps.map((step: any, idx: number) => ({
      training_path_id: path.id,
      step_order: step.step_order || idx + 1,
      title: step.title,
      description: step.description,
      content: step.content,
      sop_id: step.sop_id || null,
      quiz_questions: step.quiz_questions || [],
      required_before_next: step.required_before_next || false,
      estimated_minutes: step.estimated_minutes || 15,
    }));

    const { error: stepsError } = await supabase.from("training_path_steps").insert(stepRows);
    if (stepsError) console.error("Error inserting steps:", stepsError.message);
  }

  return NextResponse.json({ path }, { status: 201 });
}
