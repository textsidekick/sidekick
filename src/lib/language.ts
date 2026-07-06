/**
 * Language detection and translation utilities with OpenAI primary and Anthropic fallback.
 */
import { completeTextOpenAIFirst } from "@/lib/sms-ai";

/**
 * Detect the language of a text string.
 * Returns ISO language code (e.g., "en", "es", "zh", "vi", "ko", "tl").
 */
export async function detectLanguage(text: string): Promise<string> {
  try {
    const reply = await completeTextOpenAIFirst({
      openaiModel: process.env.OPENAI_SMS_LANGUAGE_MODEL || "gpt-4.1-mini",
      user: `What language is this text? Reply with ONLY the ISO 639-1 two-letter code (e.g. en, es, zh, vi, ko, tl, fr, de, ja, pt, ar, hi). Text: "${text.slice(0, 200)}"`,
      maxTokens: 10,
    });
    const code = reply.trim().toLowerCase().slice(0, 2);
    return /^[a-z]{2}$/.test(code) ? code : "en";
  } catch (error) {
    console.error("[Language] Detection failed:", error);
    return "en";
  }
}

/**
 * Translate text to a target language.
 * If targetLang is "en", returns the original text unchanged.
 */
export async function translateText(
  text: string,
  targetLang: string
): Promise<string> {
  if (targetLang === "en") return text;

  const langNames: Record<string, string> = {
    es: "Spanish",
    zh: "Chinese",
    vi: "Vietnamese",
    ko: "Korean",
    tl: "Tagalog",
    fr: "French",
    de: "German",
    ja: "Japanese",
    pt: "Portuguese",
    ar: "Arabic",
    hi: "Hindi",
    ru: "Russian",
    th: "Thai",
    pl: "Polish",
    it: "Italian",
  };

  const langName = langNames[targetLang] || targetLang;

  try {
    return await completeTextOpenAIFirst({
      openaiModel: process.env.OPENAI_SMS_LANGUAGE_MODEL || "gpt-4.1-mini",
      user: `Translate to ${langName}. Return ONLY the translation, nothing else:\n\n${text}`,
      maxTokens: 500,
    });
  } catch (error) {
    console.error("[Language] Translation failed:", error);
    return text;
  }
}

/**
 * Get the full language name from ISO code.
 */
export function getLanguageName(code: string): string {
  const names: Record<string, string> = {
    en: "English",
    es: "Spanish",
    zh: "Chinese",
    vi: "Vietnamese",
    ko: "Korean",
    tl: "Tagalog",
    fr: "French",
    de: "German",
    ja: "Japanese",
    pt: "Portuguese",
    ar: "Arabic",
    hi: "Hindi",
    ru: "Russian",
    th: "Thai",
    pl: "Polish",
    it: "Italian",
  };
  return names[code] || code;
}
