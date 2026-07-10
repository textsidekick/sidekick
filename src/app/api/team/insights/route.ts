import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";

// Topic keyword → training path name mappings
const TOPIC_TO_TRAINING: Record<string, string[]> = {
  // Bonding / sewing
  "본딩": ["봉제기술 전문과정"],
  "봉제": ["봉제기술 전문과정"],
  "재봉": ["봉제기술 전문과정"],
  "필로우": ["봉제기술 전문과정"],
  "bonding": ["봉제기술 전문과정"],
  "sewing": ["봉제기술 전문과정"],
  // Safety / new hire
  "안전": ["생산라인 신입 교육"],
  "소화기": ["생산라인 신입 교육"],
  "지게차": ["생산라인 신입 교육"],
  "forklift": ["생산라인 신입 교육"],
  "safety": ["생산라인 신입 교육"],
  "화재": ["생산라인 신입 교육"],
  // Equipment
  "설비": ["설비관리 기초"],
  "기계": ["설비관리 기초"],
  "equipment": ["설비관리 기초"],
  "스프링": ["설비관리 기초"],
  "코일": ["설비관리 기초"],
  // Quality
  "품질": ["품질검사원 양성"],
  "색상": ["품질검사원 양성"],
  "불량": ["품질검사원 양성"],
  "quality": ["품질검사원 양성"],
  "검사": ["품질검사원 양성"],
};

function getRecommendedTrainingNames(topics: string[]): string[] {
  const recommended = new Set<string>();
  for (const topic of topics) {
    const lower = topic.toLowerCase();
    for (const [keyword, trainings] of Object.entries(TOPIC_TO_TRAINING)) {
      if (lower.includes(keyword)) {
        trainings.forEach((t) => recommended.add(t));
      }
    }
  }
  return Array.from(recommended);
}

export async function GET(req: NextRequest) {
  const companyId = await getCompanyId(req);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch all questions for the company
  const { data: questions, error: qErr } = await supabase
    .from("questions")
    .select("worker_phone, worker_name, topic, answer, confidence")
    .eq("company_id", companyId);

  if (qErr) return NextResponse.json({ error: qErr.message }, { status: 500 });

  // Fetch workers
  const { data: workers, error: wErr } = await supabase
    .from("workers")
    .select("id, name, phone, role")
    .eq("company_id", companyId);

  if (wErr) return NextResponse.json({ error: wErr.message }, { status: 500 });

  // Fetch training paths
  const { data: trainingPaths, error: tpErr } = await supabase
    .from("training_paths")
    .select("id, name, role")
    .eq("company_id", companyId);

  if (tpErr) return NextResponse.json({ error: tpErr.message }, { status: 500 });

  // Fetch enrollments to know who is already enrolled
  const { data: enrollments } = await supabase
    .from("training_enrollments")
    .select("worker_phone, training_path_id")
    .eq("company_id", companyId);

  const enrollmentSet = new Set(
    (enrollments || []).map((e: { worker_phone: string; training_path_id: string }) => `${e.worker_phone}:${e.training_path_id}`)
  );

  // Group questions by worker phone
  const byWorker = new Map<string, { name: string; questions: typeof questions }>();
  for (const q of questions || []) {
    if (!q.worker_phone) continue;
    if (!byWorker.has(q.worker_phone)) {
      byWorker.set(q.worker_phone, { name: q.worker_name || q.worker_phone, questions: [] });
    }
    byWorker.get(q.worker_phone)!.questions.push(q);
  }

  const insights = workers?.map((worker) => {
    const entry = byWorker.get(worker.phone);
    const workerQuestions = entry?.questions || [];

    const totalQuestions = workerQuestions.length;

    // Count topics
    const topicCounts = new Map<string, number>();
    for (const q of workerQuestions) {
      const topic = q.topic || "general";
      topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
    }

    // Top topics (sorted by count desc)
    const topTopics = Array.from(topicCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([topic, count]) => ({ topic, count }));

    // Gaps triggered: questions with no answer or very low confidence
    const gapsTriggered = workerQuestions.filter(
      (q) => !q.answer || q.answer.trim() === "" || (q.confidence !== null && q.confidence < 0.3)
    ).length;

    // Knowledge score calculation:
    // Diversity = unique topics / total questions (higher is better)
    // Repeat penalty = questions on same topic multiple times
    let knowledgeScore = 50; // baseline for no questions
    if (totalQuestions > 0) {
      const uniqueTopics = topicCounts.size;
      const diversityRatio = uniqueTopics / totalQuestions; // 0-1
      const repeatPenalty = workerQuestions.filter((q) => topicCounts.get(q.topic || "general")! > 2).length;
      const repeatRatio = repeatPenalty / totalQuestions;
      // Score = diversity bonus - repeat penalty - gap penalty
      const raw = diversityRatio * 70 + (1 - repeatRatio) * 20 + (gapsTriggered === 0 ? 10 : 0);
      knowledgeScore = Math.min(100, Math.max(0, Math.round(raw)));
    }

    const knowledgeLevel: "high" | "medium" | "low" =
      knowledgeScore >= 65 ? "high" : knowledgeScore >= 35 ? "medium" : "low";

    // Recommended training: match topics to training paths, exclude already enrolled
    const askedTopics = topTopics.map((t) => t.topic);
    const recommendedNames = getRecommendedTrainingNames(askedTopics);

    const recommendedTraining = (trainingPaths || [])
      .filter((tp) => {
        if (!recommendedNames.includes(tp.name)) return false;
        // Exclude if already enrolled
        return !enrollmentSet.has(`${worker.phone}:${tp.id}`);
      })
      .map((tp) => ({ id: tp.id, name: tp.name, role: tp.role }));

    return {
      workerId: worker.id,
      workerPhone: worker.phone,
      workerName: worker.name || worker.phone,
      workerRole: worker.role,
      totalQuestions,
      topTopics,
      knowledgeScore,
      knowledgeLevel,
      gapsTriggered,
      recommendedTraining,
    };
  }) || [];

  // Summary: how many workers have recommendations
  const workersNeedingTraining = insights.filter((i) => i.recommendedTraining.length > 0).length;

  // For each training path, which workers are recommended?
  const trainingRecommendations = (trainingPaths || []).map((tp) => {
    const recommended = insights.filter((i) =>
      i.recommendedTraining.some((r) => r.id === tp.id)
    ).map((i) => ({
      workerId: i.workerId,
      workerPhone: i.workerPhone,
      workerName: i.workerName,
      knowledgeScore: i.knowledgeScore,
      knowledgeLevel: i.knowledgeLevel,
    }));
    return {
      trainingPathId: tp.id,
      trainingPathName: tp.name,
      recommendedWorkers: recommended,
      recommendedCount: recommended.length,
    };
  });

  return NextResponse.json({
    insights,
    workersNeedingTraining,
    trainingRecommendations,
  });
}
