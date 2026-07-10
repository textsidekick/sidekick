import { supabase } from "@/lib/supabase";
import { t, type Lang } from "@/lib/korean";

export type PositionContext = {
  id: string;
  name: string;
  name_en: string | null;
  description: string;
  department_name: string | null;
  required_skills: string[];
  sops: Array<{ slug: string; title: string; version_number: number; required: boolean }>;
  training_paths: Array<{ id: string; name: string; auto_enroll: boolean }>;
};

/**
 * Load a worker's position with its associated SOPs and training paths.
 * Returns null if the worker has no position assigned.
 */
export async function getWorkerPositionContext(
  companyId: string,
  workerPhone: string
): Promise<PositionContext | null> {
  const { data: worker } = await supabase
    .from("workers")
    .select("id, position_id")
    .eq("company_id", companyId)
    .eq("phone", workerPhone)
    .maybeSingle();

  if (!worker?.position_id) return null;
  return getPositionContext(companyId, worker.position_id);
}

export async function getPositionContext(
  companyId: string,
  positionId: string
): Promise<PositionContext | null> {
  const { data: position } = await supabase
    .from("positions")
    .select("id, name, name_en, description, required_skills, departments(name)")
    .eq("id", positionId)
    .eq("company_id", companyId)
    .maybeSingle();

  if (!position) return null;

  const [{ data: sopLinks }, { data: pathLinks }] = await Promise.all([
    supabase
      .from("position_sops")
      .select("sop_slug, required, sort_order")
      .eq("position_id", positionId)
      .order("sort_order"),
    supabase
      .from("position_training_paths")
      .select("training_path_id, auto_enroll, sort_order, training_paths(id, name)")
      .eq("position_id", positionId)
      .order("sort_order"),
  ]);

  // Resolve current SOP versions for the linked slugs
  let sops: PositionContext["sops"] = [];
  const slugs = (sopLinks || []).map((l) => l.sop_slug);
  if (slugs.length > 0) {
    const { data: sopRows } = await supabase
      .from("sops")
      .select("slug, title, version_number")
      .eq("company_id", companyId)
      .eq("is_current", true)
      .eq("status", "active")
      .in("slug", slugs);
    const bySlug = new Map((sopRows || []).map((s) => [s.slug, s]));
    sops = (sopLinks || [])
      .map((l) => {
        const s = bySlug.get(l.sop_slug);
        return s
          ? { slug: s.slug, title: s.title, version_number: s.version_number, required: l.required }
          : null;
      })
      .filter(Boolean) as PositionContext["sops"];
  }

  return {
    id: position.id,
    name: position.name,
    name_en: position.name_en,
    description: position.description || "",
    department_name: (position as any).departments?.name || null,
    required_skills: position.required_skills || [],
    sops,
    training_paths: (pathLinks || []).map((l: any) => ({
      id: l.training_path_id,
      name: l.training_paths?.name || "Training path",
      auto_enroll: l.auto_enroll,
    })),
  };
}

/**
 * Position block for the LLM system prompt. The model uses this to
 * tailor answers to the worker's actual job.
 */
export function buildPositionPromptBlock(pos: PositionContext, lang: Lang): string {
  const lines = [
    `WORKER POSITION: ${pos.name}${pos.name_en ? ` (${pos.name_en})` : ""}${pos.department_name ? ` — ${pos.department_name} department` : ""}`,
  ];
  if (pos.description) lines.push(`Position description: ${pos.description}`);
  if (pos.required_skills.length) {
    lines.push(`Required skills for this position: ${pos.required_skills.join(", ")}`);
  }
  if (pos.sops.length) {
    lines.push(
      "SOPs specifically relevant to this position (prefer these when the question is ambiguous):",
      ...pos.sops.map((s) => `  - ${s.title} (v${s.version_number})${s.required ? " [required]" : ""}`)
    );
  }
  lines.push(
    lang === "ko"
      ? "이 작업자의 직무에 맞춰 답변하세요. 직무와 무관한 절차보다 위 SOP를 우선 참조하세요."
      : "Tailor your answer to this worker's position. Prefer the SOPs above when relevant."
  );
  return lines.join("\n");
}

// ─────────────────────────────────────────────────────────────
// Auto-enrollment
// ─────────────────────────────────────────────────────────────

const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE = process.env.TWILIO_PHONE_NUMBER;

async function sendSms(to: string, body: string): Promise<boolean> {
  if (!TWILIO_SID || !TWILIO_AUTH || !TWILIO_PHONE) return false;
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: "Basic " + Buffer.from(`${TWILIO_SID}:${TWILIO_AUTH}`).toString("base64"),
        },
        body: new URLSearchParams({ To: to, From: TWILIO_PHONE, Body: body }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Enroll a worker in all auto-enroll training paths for a position.
 * Idempotent — existing enrollments are skipped. Sends Step 1 via SMS
 * in the worker's language. Returns names of the paths newly enrolled in.
 */
export async function autoEnrollWorkerInPositionPaths(opts: {
  companyId: string;
  workerPhone: string;
  positionId: string;
  lang: Lang;
  assignedBy?: string;
  sendSmsNotifications?: boolean;
}): Promise<string[]> {
  const { companyId, workerPhone, positionId, lang, assignedBy = "position_auto" } = opts;

  const { data: links } = await supabase
    .from("position_training_paths")
    .select("training_path_id, auto_enroll, training_paths(id, name)")
    .eq("position_id", positionId)
    .eq("auto_enroll", true)
    .order("sort_order");

  if (!links?.length) return [];

  const enrolledPaths: string[] = [];

  for (const link of links) {
    const pathId = link.training_path_id;
    const pathName = (link as any).training_paths?.name || "교육 과정";

    const { data: existing } = await supabase
      .from("worker_training_progress")
      .select("id")
      .eq("worker_phone", workerPhone)
      .eq("training_path_id", pathId)
      .maybeSingle();
    if (existing) continue;

    const { error } = await supabase.from("worker_training_progress").insert({
      worker_phone: workerPhone,
      company_id: companyId,
      training_path_id: pathId,
      current_step: 1,
      status: "not_started",
      assigned_by: assignedBy,
      started_at: null,
    });
    if (error) {
      console.error("[position-context] enroll error:", error.message);
      continue;
    }
    enrolledPaths.push(pathName);

    if (opts.sendSmsNotifications !== false) {
      const { data: steps } = await supabase
        .from("training_path_steps")
        .select("title, content, step_order")
        .eq("training_path_id", pathId)
        .order("step_order")
        .limit(1);
      const first = steps?.[0];
      if (first) {
        await sendSms(
          workerPhone,
          t("training_enrolled", lang, {
            path: pathName,
            step_title: first.title,
            step_content: (first.content || "").slice(0, 800),
          })
        );
      }
    }
  }

  return enrolledPaths;
}
