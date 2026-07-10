export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { supabase } from "@/lib/supabase";
import {
  detectLanguageFast,
  resolveLang,
  buildLanguageDirective,
  normalizeKoreanPhone,
  t,
  type Lang,
} from "@/lib/korean";
import {
  callbackWaitResponse,
  sendKakaoCallback,
  buildSopAnswerResponse,
  buildPositionMenuResponse,
  type KakaoSkillResponse,
  type KakaoQuickReply,
} from "@/lib/kakao";
import { getSopAnswerContext } from "@/lib/sop-retrieval";
import {
  getWorkerPositionContext,
  getPositionContext,
  buildPositionPromptBlock,
} from "@/lib/position-context";
import { completeTextOpenAIFirst } from "@/lib/sms-ai";
// import { captureKnowledge } from "@/lib/knowledge-engine";

// ─────────────────────────────────────────────────────────────
// Kakao i Open Builder request shape (v2.0)
// ─────────────────────────────────────────────────────────────

type KakaoWebhookBody = {
  userRequest?: {
    user?: { id?: string; properties?: Record<string, string> };
    utterance?: string;
    callbackUrl?: string;
  };
  bot?: { id?: string; name?: string };
  action?: { name?: string; params?: Record<string, string> };
};

type WorkerLink = {
  id: string;
  bot_user_key: string;
  company_id: string;
  worker_id: string;
  worker_phone: string;
  preferred_lang: string | null;
};

// ─────────────────────────────────────────────────────────────
// Small response helpers
// ─────────────────────────────────────────────────────────────

function textResponse(text: string, quickReplies?: KakaoQuickReply[]): KakaoSkillResponse {
  return {
    version: "2.0",
    template: {
      outputs: [{ simpleText: { text: text.slice(0, 990) } }],
      ...(quickReplies?.length ? { quickReplies: quickReplies.slice(0, 10) } : {}),
    },
  };
}

function json(res: KakaoSkillResponse) {
  return NextResponse.json(res);
}

// ─────────────────────────────────────────────────────────────
// Linking (bot user ↔ worker) — worker sends phone number once
// ─────────────────────────────────────────────────────────────

async function findWorkerLink(botUserKey: string): Promise<WorkerLink | null> {
  const { data } = await supabase
    .from("kakao_worker_links")
    .select("id, bot_user_key, company_id, worker_id, worker_phone, preferred_lang")
    .eq("bot_user_key", botUserKey)
    .maybeSingle();
  return (data as WorkerLink) || null;
}

async function tryLinkByPhone(botUserKey: string, utterance: string): Promise<WorkerLink | null> {
  // Accept 010-1234-5678, 01012345678, +821012345678 etc.
  const digits = utterance.replace(/[^\d+]/g, "");
  if (digits.replace(/\D/g, "").length < 9) return null;

  const normalized = normalizeKoreanPhone(digits);
  if (!normalized) return null;

  const { data: worker } = await supabase
    .from("workers")
    .select("id, company_id, phone, name")
    .eq("phone", normalized)
    .maybeSingle();

  if (!worker) return null;

  const { data: link } = await supabase
    .from("kakao_worker_links")
    .upsert(
      {
        bot_user_key: botUserKey,
        company_id: worker.company_id,
        worker_id: worker.id,
        worker_phone: worker.phone,
        preferred_lang: "ko",
      },
      { onConflict: "bot_user_key" }
    )
    .select("id, bot_user_key, company_id, worker_id, worker_phone, preferred_lang")
    .single();

  return (link as WorkerLink) || null;
}

// ─────────────────────────────────────────────────────────────
// Position onboarding
// ─────────────────────────────────────────────────────────────

const POSITION_SELECT_PREFIX = /^(직무선택|position)\s*[:：]\s*/i;

async function getCompanyPositions(companyId: string) {
  const { data } = await supabase
    .from("positions")
    .select("id, name, name_en, department_id")
    .eq("company_id", companyId)
    .order("name");
  return data || [];
}

async function assignPositionAndEnroll(
  companyId: string,
  workerId: string,
  positionId: string
) {
  await supabase
    .from("workers")
    .update({ position_id: positionId, pending_position_selection: false })
    .eq("id", workerId)
    .eq("company_id", companyId);

  // Auto-enroll in the position's training paths
  const ctx = await getPositionContext(companyId, positionId);
  if (ctx) {
    const autoPaths = ctx.training_paths.filter((p) => p.auto_enroll);
    for (const path of autoPaths) {
      await supabase.from("training_enrollments").upsert(
        {
          company_id: companyId,
          worker_id: workerId,
          training_path_id: path.id,
          status: "active",
          current_step: 0,
        },
        { onConflict: "worker_id,training_path_id" }
      );
    }
  }
  return ctx;
}

/**
 * Returns a KakaoSkillResponse if the message was consumed by the
 * position onboarding flow, otherwise null.
 */
async function maybeHandlePositionOnboarding(
  link: WorkerLink,
  utterance: string,
  lang: Lang
): Promise<KakaoSkillResponse | null> {
  const { data: worker } = await supabase
    .from("workers")
    .select("id, name, position_id, pending_position_selection")
    .eq("id", link.worker_id)
    .maybeSingle();

  if (!worker) return null;
  if (worker.position_id) return null; // already onboarded

  const positions = await getCompanyPositions(link.company_id);
  if (!positions.length) return null; // company hasn't configured positions

  // Did the worker just answer the position menu?
  const stripped = utterance.replace(POSITION_SELECT_PREFIX, "").trim();
  const byExact = positions.find(
    (p) =>
      p.name === stripped ||
      (p.name_en && p.name_en.toLowerCase() === stripped.toLowerCase())
  );
  const byNumber =
    /^\d{1,2}$/.test(stripped) && positions[parseInt(stripped, 10) - 1]
      ? positions[parseInt(stripped, 10) - 1]
      : null;
  const selected = byExact || byNumber;

  if (selected) {
    const ctx = await assignPositionAndEnroll(link.company_id, worker.id, selected.id);
    const label = lang === "ko" ? selected.name : selected.name_en || selected.name;
    const sopLines = ctx?.sops
      .slice(0, 5)
      .map((s) => `• ${s.title} (v${s.version_number})`)
      .join("\n");
    const msg =
      lang === "ko"
        ? `직무가 "${label}"(으)로 설정되었습니다. 👍\n` +
          (ctx?.training_paths.length
            ? `교육 과정 ${ctx.training_paths.length}개에 자동 등록되었습니다. "다음"이라고 보내면 교육을 시작합니다.\n`
            : "") +
          (sopLines ? `\n필수 SOP:\n${sopLines}` : "")
        : `Your position is now "${label}". 👍\n` +
          (ctx?.training_paths.length
            ? `You've been enrolled in ${ctx.training_paths.length} training path(s). Send "next" to start.\n`
            : "") +
          (sopLines ? `\nRequired SOPs:\n${sopLines}` : "");
    return textResponse(msg, [
      {
        label: lang === "ko" ? "교육 시작" : "Start training",
        action: "message",
        messageText: lang === "ko" ? "다음" : "next",
      },
    ]);
  }

  // Not a selection → show (or re-show) the menu
  await supabase
    .from("workers")
    .update({ pending_position_selection: true })
    .eq("id", worker.id);

  return buildPositionMenuResponse(positions, lang);
}

// ─────────────────────────────────────────────────────────────
// Training navigation (다음 / 완료 / next / done)
// ─────────────────────────────────────────────────────────────

const TRAINING_NEXT_RE = /^(다음|계속|next)$/i;
const TRAINING_DONE_RE = /^(완료|끝|done|complete)$/i;

async function maybeHandleTrainingNav(
  link: WorkerLink,
  utterance: string,
  lang: Lang
): Promise<KakaoSkillResponse | null> {
  const trimmed = utterance.trim();
  const isNext = TRAINING_NEXT_RE.test(trimmed);
  const isDone = TRAINING_DONE_RE.test(trimmed);
  if (!isNext && !isDone) return null;

  const { data: enrollment } = await supabase
    .from("training_enrollments")
    .select("id, training_path_id, current_step, status, training_paths(name)")
    .eq("worker_id", link.worker_id)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!enrollment) {
    return textResponse(
      lang === "ko"
        ? "진행 중인 교육 과정이 없습니다. 궁금한 점을 물어보시면 SOP 기준으로 답변해 드릴게요."
        : "You have no active training. Ask me any question and I'll answer from the approved SOPs."
    );
  }

  const { data: steps } = await supabase
    .from("training_steps")
    .select("id, sort_order, title, content")
    .eq("training_path_id", enrollment.training_path_id)
    .order("sort_order");

  const total = steps?.length || 0;
  const pathName = (enrollment as any).training_paths?.name || "Training";

  if (isDone || (isNext && enrollment.current_step + 1 >= total)) {
    // Mark step / path complete
    const finished = enrollment.current_step + 1 >= total;
    await supabase
      .from("training_enrollments")
      .update(
        finished
          ? { status: "completed", completed_at: new Date().toISOString() }
          : { current_step: enrollment.current_step + 1 }
      )
      .eq("id", enrollment.id);

    if (finished) {
      return textResponse(
        lang === "ko"
          ? `🎉 "${pathName}" 교육 과정을 완료했습니다! 수고하셨습니다.`
          : `🎉 You've completed the "${pathName}" training path. Great work!`
      );
    }
  }

  const nextIndex = isNext ? enrollment.current_step : enrollment.current_step;
  const step = steps?.[Math.min(nextIndex, total - 1)];
  if (!step) {
    return textResponse(
      lang === "ko" ? "교육 내용을 불러오지 못했습니다." : "Couldn't load the training content."
    );
  }

  // Advance pointer after serving the step
  await supabase
    .from("training_enrollments")
    .update({ current_step: Math.min(nextIndex + 1, total) })
    .eq("id", enrollment.id);

  const header =
    lang === "ko"
      ? `📘 ${pathName} — 단계 ${nextIndex + 1}/${total}\n${step.title}`
      : `📘 ${pathName} — Step ${nextIndex + 1}/${total}\n${step.title}`;

  return textResponse(`${header}\n\n${step.content}`, [
    { label: lang === "ko" ? "다음" : "Next", action: "message", messageText: lang === "ko" ? "다음" : "next" },
    { label: lang === "ko" ? "완료" : "Done", action: "message", messageText: lang === "ko" ? "완료" : "done" },
  ]);
}

// ─────────────────────────────────────────────────────────────
// The QA answer pipeline (shared by sync + callback paths)
// ─────────────────────────────────────────────────────────────

async function buildAnswer(link: WorkerLink, question: string, lang: Lang) {
  const [sopCtx, positionCtx] = await Promise.all([
    getSopAnswerContext(link.company_id, question, { workerPhone: link.worker_phone }),
    getWorkerPositionContext(link.company_id, link.worker_phone),
  ]);

  let system =
    "You are Sidekick, a factory-floor assistant for Ace Bed (에이스침대). " +
    "Answer worker questions concisely and practically for a mobile chat message. " +
    "SOPs are the source of truth — when an SOP is provided below, base your answer on it " +
    "and cite it by name and version (e.g. \"매트리스 봉제 SOP v3 기준\"). " +
    "If you don't know, say so and suggest asking a supervisor. Never invent procedures.";

  if (sopCtx.promptBlock) system += "\n\n" + sopCtx.promptBlock;
  if (positionCtx) system += "\n\n" + buildPositionPromptBlock(positionCtx, lang);
  system += "\n\n" + buildLanguageDirective(lang);

  const answer = await completeTextOpenAIFirst({
    system,
    user: question,
    maxTokens: 700,
  });

  // Log for KM loop (captureKnowledge signature mismatch — log for now)
  console.log(`[Kakao KM] company=${link.company_id} worker=${link.worker_phone} q="${question.slice(0,80)}" sops=${sopCtx.sops.length}`);

  return { answer, sops: sopCtx.sops };
}

// ─────────────────────────────────────────────────────────────
// POST handler
// ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  let body: KakaoWebhookBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const botUserKey = body.userRequest?.user?.id || "";
  const utterance = (body.userRequest?.utterance || "").trim();
  const callbackUrl = body.userRequest?.callbackUrl || null;

  if (!botUserKey || !utterance) {
    return json(textResponse("메시지를 이해하지 못했어요. 다시 보내주세요."));
  }

  // 1) Resolve worker link
  let link = await findWorkerLink(botUserKey);
  if (!link) {
    link = await tryLinkByPhone(botUserKey, utterance);
    if (link) {
      return json(
        textResponse(
          "등록되었습니다. 이제 작업 관련 질문을 자유롭게 물어보세요.\n" +
            "예: \"본딩기 청소 방법 알려줘\", \"매트리스 봉제 SOP 보여줘\"\n\n" +
            "You're registered. Ask me anything about your work."
        )
      );
    }
    return json(
      textResponse(
        "안녕하세요! 사이드킥입니다.\n" +
          "등록을 위해 회사에 등록된 휴대폰 번호를 보내주세요. (예: 010-1234-5678)\n\n" +
          "Hi! Please send your registered phone number to link your account."
      )
    );
  }

  // 2) Language detection (fast, no LLM)
  const detected = detectLanguageFast(utterance);
  const lang: Lang = detected || resolveLang(link.preferred_lang);
  if (detected && detected !== link.preferred_lang) {
    supabase
      .from("kakao_worker_links")
      .update({ preferred_lang: detected })
      .eq("id", link.id)
      .then(() => {});
  }

  // 3) Log inbound message (best effort)
  supabase
    .from("messages")
    .insert({
      company_id: link.company_id,
      worker_phone: link.worker_phone,
      direction: "inbound",
      channel: "kakao",
      body: utterance,
      language: lang,
    })
    .then(() => {});

  // 4) Position onboarding gate
  try {
    const onboarding = await maybeHandlePositionOnboarding(link, utterance, lang);
    if (onboarding) return json(onboarding);
  } catch (e) {
    console.error("Position onboarding error:", e);
  }

  // 5) Training navigation
  try {
    const training = await maybeHandleTrainingNav(link, utterance, lang);
    if (training) return json(training);
  } catch (e) {
    console.error("Training nav error:", e);
  }

  // 6) Normal question → SOP-first QA
  if (callbackUrl) {
    // ACK immediately (Kakao requires <5s), answer via AI 챗봇 콜백 (≤1 min)
    const work = (async () => {
      try {
        const { answer, sops } = await buildAnswer(link!, utterance, lang);
        await sendKakaoCallback(callbackUrl, buildSopAnswerResponse(answer, sops, lang));
        await supabase.from("messages").insert({
          company_id: link!.company_id,
          worker_phone: link!.worker_phone,
          direction: "outbound",
          channel: "kakao",
          body: answer,
          language: lang,
        });
      } catch (e) {
        console.error("Kakao callback pipeline failed:", e);
        await sendKakaoCallback(
          callbackUrl,
          textResponse(
            lang === "ko"
              ? "죄송해요, 답변 생성 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
              : "Sorry, something went wrong generating your answer. Please try again."
          )
        ).catch(() => {});
      }
    })();
    after(work); // keep the function alive after we return the ACK
    return json(callbackWaitResponse(lang));
  }

  // No callbackUrl (callback not enabled on this block) → answer synchronously
  try {
    const { answer, sops } = await buildAnswer(link, utterance, lang);
    return json(buildSopAnswerResponse(answer, sops, lang));
  } catch (e) {
    console.error("Kakao sync answer failed:", e);
    return json(
      textResponse(
        lang === "ko"
          ? "죄송해요, 오류가 발생했습니다. 잠시 후 다시 시도해 주세요."
          : "Sorry, something went wrong. Please try again shortly."
      )
    );
  }
}

// Kakao Open Builder health checks sometimes probe with GET
export async function GET() {
  return NextResponse.json({ ok: true, service: "sidekick-kakao-webhook" });
}
