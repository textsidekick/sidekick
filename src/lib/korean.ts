/**
 * korean.ts — Korean (한국어) language support for Sidekick.
 *
 * - Fast, zero-cost hangul detection (no LLM round-trip)
 * - Bilingual SMS message catalog (ko / en)
 * - Korean FTS query normalization (particle stripping for 'simple' config)
 * - Korean locale date/time formatting
 * - Korean phone number normalization (+82)
 * - LLM language directives (respond in the worker's language)
 */

export type Lang = "ko" | "en";

// ─────────────────────────────────────────────────────────────
// Detection
// ─────────────────────────────────────────────────────────────

// Hangul Jamo, Compatibility Jamo, and Syllables blocks
const HANGUL_RE = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/;
const HANGUL_G = /[\u1100-\u11FF\u3130-\u318F\uAC00-\uD7AF]/g;

export function containsHangul(text: string): boolean {
  return HANGUL_RE.test(text);
}

export function hangulRatio(text: string): number {
  const meaningful = text.replace(/[\s\d\p{P}]/gu, "");
  if (!meaningful.length) return 0;
  const hangul = meaningful.match(HANGUL_G)?.length || 0;
  return hangul / meaningful.length;
}

/**
 * Fast language detection without an LLM call.
 * Returns "ko" for hangul-dominant or mixed Korean-English text,
 * "en" for pure-ASCII text, and null when uncertain (caller may
 * fall back to LLM-based detectLanguage() for other languages).
 */
export function detectLanguageFast(text: string): Lang | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  // Any meaningful hangul presence → treat as Korean.
  // Korean workers frequently mix English machine names into hangul text
  // ("본딩기 error 났어요") — that is still a Korean message.
  if (hangulRatio(trimmed) >= 0.15 || (containsHangul(trimmed) && trimmed.length <= 20)) {
    return "ko";
  }
  // Pure basic-latin → English
  if (/^[\x00-\x7F]+$/.test(trimmed)) return "en";
  return null; // could be Spanish, Vietnamese, etc — defer to LLM detection
}

export function resolveLang(candidate: string | null | undefined): Lang {
  return candidate === "ko" ? "ko" : "en";
}

// ─────────────────────────────────────────────────────────────
// FTS normalization for Korean ('simple' config keeps tokens intact,
// but agglutinative particles break exact-token matching:
// "본딩기의 청소방법" won't match "본딩기 청소". We strip common
// trailing particles (조사) and emit both original + stem tokens.)
// ─────────────────────────────────────────────────────────────

const KOREAN_PARTICLES = [
  "은", "는", "이", "가", "을", "를", "과", "와", "의", "도", "만",
  "에", "에서", "에게", "께", "으로", "로", "부터", "까지", "처럼",
  "보다", "마다", "이나", "나", "든지", "라도", "요",
].sort((a, b) => b.length - a.length); // longest first

export function stripKoreanParticle(token: string): string {
  if (!containsHangul(token)) return token;
  for (const p of KOREAN_PARTICLES) {
    if (token.length > p.length + 1 && token.endsWith(p)) {
      return token.slice(0, token.length - p.length);
    }
  }
  return token;
}

/**
 * Expand a query for 'simple'-config FTS so particle-suffixed Korean
 * tokens still match. Returns the original query plus stemmed tokens.
 */
export function normalizeKoreanForSearch(query: string): string {
  if (!containsHangul(query)) return query;
  const tokens = query.split(/\s+/).filter(Boolean);
  const extras = new Set<string>();
  for (const tok of tokens) {
    const stem = stripKoreanParticle(tok);
    if (stem !== tok && stem.length >= 1) extras.add(stem);
  }
  return extras.size ? `${query} ${[...extras].join(" ")}` : query;
}

// ─────────────────────────────────────────────────────────────
// LLM directives
// ─────────────────────────────────────────────────────────────

export function buildLanguageDirective(lang: Lang): string {
  if (lang === "ko") {
    return [
      "LANGUAGE: The worker is texting in Korean. You MUST respond in natural, polite Korean (존댓말, 해요체).",
      "- Keep answers short and SMS-friendly (under 450 characters when possible).",
      "- Keep machine names, model numbers, and English technical terms as-is (e.g. 'LOTO', '본딩기 M-200').",
      "- When citing an SOP, cite it in Korean, e.g. '매트리스 봉제 SOP v3 기준입니다.'",
      "- Use metric units and 24-hour times.",
    ].join("\n");
  }
  return "LANGUAGE: Respond in the same language the worker used. If they text in Korean, respond in Korean (존댓말).";
}

// ─────────────────────────────────────────────────────────────
// Bilingual SMS message catalog
// ─────────────────────────────────────────────────────────────

type Catalog = Record<string, { en: string; ko: string }>;

const MESSAGES: Catalog = {
  welcome: {
    en: "Welcome to {company}! I'm Sidekick — text me any work question and I'll answer instantly.",
    ko: "{company}에 오신 것을 환영합니다! 저는 사이드킥입니다. 업무 관련 궁금한 점을 문자로 보내주시면 바로 답변해 드립니다.",
  },
  position_prompt: {
    en: "Quick question so I can help you better — what's your position? Reply with a number:\n{options}",
    ko: "더 정확한 안내를 위해 여쭤봅니다 — 어떤 직무를 맡고 계신가요? 번호로 답장해 주세요:\n{options}",
  },
  position_confirmed: {
    en: "Got it — you're a {position}! {training_note}Text me anytime with questions about your work.",
    ko: "확인되었습니다 — {position}이시군요! {training_note}업무 관련 질문이 있으시면 언제든 문자 주세요.",
  },
  position_training_note: {
    en: "I've enrolled you in your onboarding training ({paths}). You'll get Step 1 shortly. ",
    ko: "직무 교육 과정({paths})에 자동 등록해 드렸습니다. 곧 1단계 교육 내용을 보내드립니다. ",
  },
  position_invalid: {
    en: "Please reply with one of the numbers:\n{options}\nOr reply SKIP to answer later.",
    ko: "아래 번호 중 하나로 답장해 주세요:\n{options}\n나중에 답하시려면 '건너뛰기'라고 보내주세요.",
  },
  position_skipped: {
    en: "No problem — you can tell me your position anytime by texting 'my position is ...'. What can I help with?",
    ko: "알겠습니다 — 언제든지 '제 직무는 ...'이라고 알려주시면 됩니다. 무엇을 도와드릴까요?",
  },
  training_enrolled: {
    en: "📚 You've been enrolled in: {path}\n\nStep 1: {step_title}\n\n{step_content}\n\nReply NEXT for next step, DONE when complete.",
    ko: "📚 교육 과정에 등록되었습니다: {path}\n\n1단계: {step_title}\n\n{step_content}\n\n다음 단계는 '다음', 완료 시 '완료'라고 답장해 주세요.",
  },
  training_step: {
    en: "Step {n}: {step_title}\n\n{step_content}\n\nReply NEXT for next step, DONE when complete.",
    ko: "{n}단계: {step_title}\n\n{step_content}\n\n다음 단계는 '다음', 완료 시 '완료'라고 답장해 주세요.",
  },
  training_complete: {
    en: "🎉 Congratulations! You've completed the training path: {path}",
    ko: "🎉 축하합니다! 교육 과정을 모두 완료하셨습니다: {path}",
  },
  escalated: {
    en: "I couldn't find that in the company docs. I've sent your question to {manager} and will text you their answer.",
    ko: "회사 자료에서 해당 내용을 찾지 못했습니다. {manager}님께 질문을 전달했으며, 답변이 오면 바로 알려드리겠습니다.",
  },
  error_generic: {
    en: "Sorry, something went wrong. Please try again in a moment.",
    ko: "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.",
  },
  safety_reminder: {
    en: "⚠️ Safety first: follow lockout/tagout and wear required PPE.",
    ko: "⚠️ 안전 제일: 반드시 잠금·표지(LOTO) 절차를 준수하고 지정된 보호구(PPE)를 착용하세요.",
  },
};

export function t(
  key: keyof typeof MESSAGES,
  lang: Lang,
  vars: Record<string, string | number> = {}
): string {
  const template = MESSAGES[key]?.[lang] ?? MESSAGES[key]?.en ?? "";
  return template.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
}

// ─────────────────────────────────────────────────────────────
// Korean intent keywords (used by SMS parsing)
// ─────────────────────────────────────────────────────────────

export const KO_KEYWORDS = {
  next: [/^다음$/, /^다음\s*단계$/, /^계속$/],
  done: [/^완료$/, /^끝$/, /^다\s*했어요?$/, /^했습니다$/, /^완료했습니다$/],
  help: [/^도움$/, /^도와줘요?$/, /^도와주세요$/, /^모르겠어요?$/, /^막혔어요?$/, /^문제$/],
  skip: [/^건너뛰기$/, /^건너뛰어요?$/, /^스킵$/, /^나중에$/],
  yes: [/^네$/, /^예$/, /^맞아요?$/, /^맞습니다$/, /^응$/],
  no: [/^아니요?$/, /^아닙니다$/, /^아냐$/],
};

export function matchKoIntent(text: string, intent: keyof typeof KO_KEYWORDS): boolean {
  const norm = text.trim();
  return KO_KEYWORDS[intent].some((re) => re.test(norm));
}

// ─────────────────────────────────────────────────────────────
// Locale formatting
// ─────────────────────────────────────────────────────────────

export function formatDate(date: Date | string, lang: Lang): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(lang === "ko" ? "ko-KR" : "en-US", {
    year: "numeric", month: "long", day: "numeric", weekday: "short",
    timeZone: lang === "ko" ? "Asia/Seoul" : undefined,
  }).format(d);
}

export function formatDateTime(date: Date | string, lang: Lang): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(lang === "ko" ? "ko-KR" : "en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false,
    timeZone: lang === "ko" ? "Asia/Seoul" : undefined,
  }).format(d);
}

export function formatRelativeTime(date: Date | string, lang: Lang): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffSec = Math.round((d.getTime() - Date.now()) / 1000);
  const rtf = new Intl.RelativeTimeFormat(lang === "ko" ? "ko" : "en", { numeric: "auto" });
  const abs = Math.abs(diffSec);
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 2592000) return rtf.format(Math.round(diffSec / 86400), "day");
  return rtf.format(Math.round(diffSec / 2592000), "month");
}

// ─────────────────────────────────────────────────────────────
// Korean phone normalization (+82)
// ─────────────────────────────────────────────────────────────

/**
 * Normalizes Korean mobile numbers to E.164.
 *   "010-1234-5678"  → "+821012345678"
 *   "01012345678"    → "+821012345678"
 *   "+82 10 1234 5678" → "+821012345678"
 * Non-Korean numbers are returned cleaned but otherwise unchanged.
 */
export function normalizeKoreanPhone(raw: string): string {
  const clean = raw.replace(/[\s\-().]/g, "");
  if (clean.startsWith("+82")) return "+82" + clean.slice(3).replace(/^0/, "");
  if (/^0(10|11|16|17|18|19)\d{7,8}$/.test(clean)) return "+82" + clean.slice(1);
  if (clean.startsWith("+")) return clean;
  return clean;
}
