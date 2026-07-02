/**
 * Language detection and translation utilities using Claude.
 */
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "placeholder",
});

/**
 * Detect the language of a text string.
 * Returns ISO language code (e.g., "en", "es", "zh", "vi", "ko", "tl").
 */
export async function detectLanguage(text: string): Promise<string> {
  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 10,
      messages: [
        {
          role: "user",
          content: `What language is this text? Reply with ONLY the ISO 639-1 two-letter code (e.g. en, es, zh, vi, ko, tl, fr, de, ja, pt, ar, hi). Text: "${text.slice(0, 200)}"`,
        },
      ],
    });
    const code =
      response.content[0].type === "text"
        ? response.content[0].text.trim().toLowerCase().slice(0, 2)
        : "en";
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
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 500,
      messages: [
        {
          role: "user",
          content: `Translate to ${langName}. Return ONLY the translation, nothing else:\n\n${text}`,
        },
      ],
    });
    return response.content[0].type === "text"
      ? response.content[0].text.trim()
      : text;
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
