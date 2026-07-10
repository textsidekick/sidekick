import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";

// GET /api/training — plans with steps + assignment stats
export async function GET(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: plans }, { data: assignments }] = await Promise.all([
    supabase
      .from("training_plans")
      .select("*, training_plan_steps(*)")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false }),
    supabase
      .from("training_assignments")
      .select("id, plan_id, worker_phone, worker_name, status, started_at, completed_at, created_at")
      .eq("company_id", companyId),
  ]);

  const byPlan = new Map<string, any[]>();
  for (const a of assignments || []) {
    if (!byPlan.has(a.plan_id)) byPlan.set(a.plan_id, []);
    byPlan.get(a.plan_id)!.push(a);
  }

  const enriched = (plans || []).map((p: any) => {
    const planAssignments = byPlan.get(p.id) || [];
    const steps = (p.training_plan_steps || []).sort(
      (a: any, b: any) => a.step_order - b.step_order
    );
    return {
      ...p,
      training_plan_steps: undefined,
      steps,
      assignments: planAssignments,
      stats: {
        assigned: planAssignments.length,
        inProgress: planAssignments.filter((a) => a.status === "in_progress").length,
        completed: planAssignments.filter((a) => a.status === "completed").length,
      },
    };
  });

  return NextResponse.json({ plans: enriched });
}

// POST /api/training — create plan with steps
export async function POST(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { title, description = "", department_id = null, role = "", steps = [], created_by = "" } = body || {};

  if (!title?.trim()) return NextResponse.json({ error: "title is required" }, { status: 400 });
  if (!Array.isArray(steps) || steps.length === 0) {
    return NextResponse.json({ error: "at least one step is required" }, { status: 400 });
  }

  const { data: plan, error } = await supabase
    .from("training_plans")
    .insert({ company_id: companyId, title: title.trim(), description, department_id, role, created_by })
    .select()
    .single();
  if (error) return NextResponse.json({ error: "Failed to create plan" }, { status: 500 });

  const { error: stepsError } = await supabase.from("training_plan_steps").insert(
    steps.map((s: any, i: number) => ({
      plan_id: plan.id,
      step_order: i,
      kind: s.kind || "sop",
      ref_slug: s.ref_slug || null,
      title: s.title || `Step ${i + 1}`,
      instructions: s.instructions || "",
    }))
  );
  if (stepsError) {
    await supabase.from("training_plans").delete().eq("id", plan.id);
    return NextResponse.json({ error: "Failed to create steps" }, { status: 500 });
  }

  return NextResponse.json({ plan }, { status: 201 });
}
