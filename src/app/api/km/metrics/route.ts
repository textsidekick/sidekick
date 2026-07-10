import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";

// GET /api/km/metrics?companyId=xxx
// Returns aggregated KM metrics for the overview dashboard
export async function GET(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [
    { data: sops },
    { data: gaps },
    { data: enrollments },
    { data: departments },
    { data: questions },
  ] = await Promise.all([
    supabase.from("sops").select("id,status,department_id").eq("company_id", companyId).eq("is_current", true),
    supabase.from("knowledge_gaps").select("id,status,department_id").eq("company_id", companyId),
    supabase.from("training_enrollments").select("status,training_path_id").in(
      "training_path_id",
      (await supabase.from("training_paths").select("id").eq("company_id", companyId)).data?.map((p) => p.id) || []
    ),
    supabase.from("departments").select("id,name,color").eq("company_id", companyId),
    supabase.from("questions").select("id,answer").eq("company_id", companyId),
  ]);

  const allSops = sops || [];
  const allGaps = gaps || [];
  const allEnrollments = enrollments || [];
  const allDepts = departments || [];
  const allQuestions = questions || [];

  const totalSops = allSops.length;
  const activeSops = allSops.filter((s) => s.status === "active").length;
  const openGaps = allGaps.filter((g) => g.status !== "resolved" && g.status !== "closed").length;
  const closedGaps = allGaps.filter((g) => g.status === "resolved" || g.status === "closed").length;
  const totalEnrollments = allEnrollments.length;
  const completedEnrollments = allEnrollments.filter((e) => e.status === "completed").length;
  const trainingCompletionPct = totalEnrollments > 0 ? Math.round((completedEnrollments / totalEnrollments) * 100) : 0;

  const totalQuestions = allQuestions.length;
  const answeredQuestions = allQuestions.filter((q) => q.answer && q.answer.trim().length > 0).length;

  // Per-department scores
  const departmentScores = allDepts.map((dept) => {
    const deptSops = allSops.filter((s) => s.department_id === dept.id).length;
    const deptGaps = allGaps.filter((g) => g.department_id === dept.id && g.status !== "resolved" && g.status !== "closed").length;
    return {
      id: dept.id,
      name: dept.name,
      color: dept.color,
      sopCount: deptSops,
      openGapCount: deptGaps,
    };
  });

  return NextResponse.json({
    totalSops,
    activeSops,
    totalQuestions,
    answeredQuestions,
    openGaps,
    closedGaps,
    trainingCompletionPct,
    totalEnrollments,
    completedEnrollments,
    departmentScores,
  });
}
