/**
 * kakao.ts — KakaoTalk Channel (카카오톡 채널) messaging utilities.
 *
 * Covers three surfaces:
 *  1. Kakao i Open Builder SKILL responses (synchronous webhook replies)
 *     — simpleText / basicCard / listCard / carousel / quickReplies
 *  2. Kakao i Open Builder CALLBACK responses (AI 챗봇 콜백, ≤1 min async)
 *  3. Proactive outbound messages:
 *     - Event API push (bot-api.kakao.com) for bot users
 *     - AlimTalk (알림톡) template messages via a Solapi-compatible
 *       BizMessage provider (for workers reachable by phone number)
 *
 * Env:
 *  KAKAO_REST_API_KEY        — Kakao developers REST API key
 *  KAKAO_REFRESH_TOKEN       — initial OAuth refresh token (rotated into DB)
 *  KAKAO_BOT_ID              — Open Builder bot id (event API)
 *  KAKAO_EVENT_API_KEY       — Open Builder event API key
 *  KAKAO_CHANNEL_PF_ID       — 카카오톡 채널 pfId (AlimTalk)
 *  SOLAPI_API_KEY / SOLAPI_API_SECRET / SOLAPI_SENDER — AlimTalk provider
 */

import crypto from "crypto";
import { supabase } from "@/lib/supabase";
import type { Lang } from "@/lib/korean";

// ─────────────────────────────────────────────────────────────
// Skill response types (Open Builder v2.0)
// ─────────────────────────────────────────────────────────────

export type KakaoQuickReply = {
  label: string;
  action: "message" | "block";
  messageText?: string;
  blockId?: string;
};

export type KakaoButton = {
  label: string;
  action: "message" | "webLink" | "block" | "phone";
  messageText?: string;
  webLinkUrl?: string;
  blockId?: string;
  phoneNumber?: string;
};

export type KakaoOutput =
  | { simpleText: { text: string } }
  | { simpleImage: { imageUrl: string; altText: string } }
  | {
      basicCard: {
        title?: string;
        description?: string;
        thumbnail?: { imageUrl: string; fixedRatio?: boolean };
        buttons?: KakaoButton[];
      };
    }
  | {
      listCard: {
        header: { title: string };
        items: Array<{ title: string; description?: string; action?: "message"; messageText?: string }>;
        buttons?: KakaoButton[];
      };
    }
  | { carousel: { type: "basicCard"; items: any[] } };

export type KakaoSkillResponse = {
  version: "2.0";
  template?: { outputs: KakaoOutput[]; quickReplies?: KakaoQuickReply[] };
  useCallback?: boolean;
  data?: Record<string, string>;
};

// Kakao hard limits
const SIMPLE_TEXT_MAX = 1000;
const MAX_OUTPUTS = 3;
const MAX_QUICK_REPLIES = 10;
const QUICK_REPLY_LABEL_MAX = 14;

// ─────────────────────────────────────────────────────────────
// Response builders
// ─────────────────────────────────────────────────────────────

export function chunkText(text: string, size = SIMPLE_TEXT_MAX - 10): string[] {
  const chunks: string[] = [];
  let remaining = text.trim();
  while (remaining.length > 0 && chunks.length < MAX_OUTPUTS) {
    if (remaining.length <= size) {
      chunks.push(remaining);
      break;
    }
    // Prefer breaking on newline, then sentence end, then space
    let cut = remaining.lastIndexOf("\n", size);
    if (cut < size * 0.5) cut = remaining.lastIndexOf(". ", size);
    if (cut < size * 0.5) cut = remaining.lastIndexOf(" ", size);
    if (cut < size * 0.5) cut = size;
    chunks.push(remaining.slice(0, cut).trim());
    remaining = remaining.slice(cut).trim();
  }
  return chunks;
}

export function textResponse(text: string, quickReplies?: KakaoQuickReply[]): KakaoSkillResponse {
  return {
    version: "2.0",
    template: {
      outputs: chunkText(text).map((t) => ({ simpleText: { text: t } })),
      ...(quickReplies?.length
        ? {
            quickReplies: quickReplies.slice(0, MAX_QUICK_REPLIES).map((q) => ({
              ...q,
              label: q.label.slice(0, QUICK_REPLY_LABEL_MAX),
            })),
          }
        : {}),
    },
  };
}

export function skillResponse(outputs: KakaoOutput[], quickReplies?: KakaoQuickReply[]): KakaoSkillResponse {
  return {
    version: "2.0",
    template: {
      outputs: outputs.slice(0, MAX_OUTPUTS),
      ...(quickReplies?.length ? { quickReplies: quickReplies.slice(0, MAX_QUICK_REPLIES) } : {}),
    },
  };
}

/** Immediate ACK when we'll deliver the real answer via callbackUrl. */
export function callbackWaitResponse(lang: Lang): KakaoSkillResponse {
  return {
    version: "2.0",
    useCallback: true,
    data: {
      text:
        lang === "ko"
          ? "확인하고 있어요. 잠시만 기다려 주세요… 🔎"
          : "Looking that up for you, one moment… 🔎",
    },
  };
}

// ─────────────────────────────────────────────────────────────
// Domain templates
// ─────────────────────────────────────────────────────────────

/** Position selection menu as a listCard + numbered quick replies. */
export function buildPositionMenuResponse(
  positions: Array<{ name: string; name_en: string | null; department_name?: string | null }>,
  lang: Lang
): KakaoSkillResponse {
  const items = positions.slice(0, 5).map((p, i) => ({
    title: `${i + 1}. ${p.name}`,
    description: [p.department_name, lang === "en" ? p.name_en : null].filter(Boolean).join(" · ") || undefined,
    action: "message" as const,
    messageText: p.name,
  }));

  const quickReplies: KakaoQuickReply[] = positions.slice(0, MAX_QUICK_REPLIES).map((p, i) => ({
    label: `${i + 1}. ${p.name}`.slice(0, QUICK_REPLY_LABEL_MAX),
    action: "message",
    messageText: p.name,
  }));

  return skillResponse(
    [
      {
        listCard: {
          header: { title: lang === "ko" ? "직무를 선택해 주세요 👷" : "Select your position 👷" },
          items,
        },
      },
      ...(positions.length > 5
        ? [
            {
              simpleText: {
                text:
                  lang === "ko"
                    ? `이 외 직무: ${positions.slice(5).map((p, i) => `${i + 6}. ${p.name}`).join(", ")}\n번호나 직무명을 보내주세요.`
                    : `More: ${positions.slice(5).map((p, i) => `${i + 6}. ${p.name}`).join(", ")}\nReply with a number or the position name.`,
              },
            } as KakaoOutput,
          ]
        : []),
    ],
    quickReplies
  );
}

/** Training step card (교육 단계) with next-step / ask-question buttons. */
export function buildTrainingStepCard(opts: {
  pathName: string;
  stepNumber: number;
  totalSteps: number;
  title: string;
  description: string;
  imageUrl?: string;
  lang: Lang;
}): KakaoSkillResponse {
  const { lang } = opts;
  return skillResponse(
    [
      {
        basicCard: {
          title: `📚 ${opts.pathName} — ${lang === "ko" ? "단계" : "Step"} ${opts.stepNumber}/${opts.totalSteps}`,
          description: `${opts.title}\n\n${opts.description}`.slice(0, 760),
          ...(opts.imageUrl ? { thumbnail: { imageUrl: opts.imageUrl } } : {}),
          buttons: [
            {
              label: lang === "ko" ? "✅ 완료했어요" : "✅ Done",
              action: "message",
              messageText: lang === "ko" ? "완료" : "done",
            },
            {
              label: lang === "ko" ? "❓ 질문하기" : "❓ Ask a question",
              action: "message",
              messageText: lang === "ko" ? "질문 있어요" : "I have a question",
            },
          ],
        },
      },
    ],
    [
      { label: lang === "ko" ? "다음 단계" : "Next step", action: "message", messageText: lang === "ko" ? "다음" : "next" },
      { label: lang === "ko" ? "그만하기" : "Stop", action: "message", messageText: lang === "ko" ? "그만" : "stop" },
    ]
  );
}

/** SOP answer card citing the SOP name + version. */
export function buildSopAnswerResponse(
  answer: string,
  sops: Array<{ title: string; version_number: number }>,
  lang: Lang
): KakaoSkillResponse {
  const citation =
    sops.length > 0
      ? (lang === "ko" ? "\n\n📄 근거: " : "\n\n📄 Source: ") +
        sops.map((s) => `${s.title} v${s.version_number}`).join(", ")
      : "";
  return textResponse(answer + citation);
}

// ─────────────────────────────────────────────────────────────
// Callback delivery (AI 챗봇 콜백)
// ─────────────────────────────────────────────────────────────

export async function sendKakaoCallback(callbackUrl: string, response: KakaoSkillResponse): Promise<boolean> {
  try {
    const res = await fetch(callbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(response),
    });
    if (!res.ok) {
      console.error(`[Kakao] Callback failed: ${res.status} ${res.statusText}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error("[Kakao] Callback delivery error:", error);
    return false;
  }
}
