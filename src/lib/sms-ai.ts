import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "placeholder" });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "placeholder" });

function extractAnthropicText(blocks: Array<{ type: string; text?: string }>): string {
  return blocks
    .filter((block) => block.type === "text" && typeof block.text === "string")
    .map((block) => block.text?.trim() || "")
    .filter(Boolean)
    .join("\n")
    .trim();
}

function toAnthropicImageMediaType(mediaType: string): "image/jpeg" | "image/png" | "image/gif" | "image/webp" {
  const normalized = mediaType.toLowerCase();
  if (normalized.includes("png")) return "image/png";
  if (normalized.includes("gif")) return "image/gif";
  if (normalized.includes("webp")) return "image/webp";
  return "image/jpeg";
}

export async function completeTextOpenAIFirst(params: {
  system?: string;
  user: string;
  maxTokens?: number;
  openaiModel?: string;
  anthropicModel?: string;
}) {
  const {
    system,
    user,
    maxTokens = 300,
    openaiModel = process.env.OPENAI_SMS_MODEL || "gpt-4.1",
    anthropicModel = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
  } = params;

  let anthropicError: unknown = null;

  // Primary: Anthropic (Claude)
  try {
    const response = await anthropic.messages.create({
      model: anthropicModel,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    });

    const text = extractAnthropicText(response.content as Array<{ type: string; text?: string }>);
    if (text) return text;
    throw new Error("Anthropic returned empty text");
  } catch (error) {
    anthropicError = error;
    console.error("[SMS-AI] Anthropic text request failed, falling back to OpenAI:", error);
  }

  // Fallback: OpenAI
  try {
    const response = await openai.chat.completions.create({
      model: openaiModel,
      max_tokens: maxTokens,
      messages: [
        ...(system ? [{ role: "system" as const, content: system }] : []),
        { role: "user" as const, content: user },
      ],
    });

    const text = response.choices[0]?.message?.content?.trim() || "";
    if (text) return text;
    throw new Error("OpenAI fallback returned empty text");
  } catch (error) {
    console.error("[SMS-AI] OpenAI fallback also failed:", error);
  }

  if (anthropicError) throw anthropicError;
  throw new Error("Both Anthropic and OpenAI failed");
}

export async function completeJsonOpenAIFirst(params: {
  system?: string;
  user: string;
  maxTokens?: number;
  openaiModel?: string;
  anthropicModel?: string;
}) {
  const {
    system,
    user,
    maxTokens = 900,
    openaiModel = process.env.OPENAI_SMS_TRIAGE_MODEL || process.env.OPENAI_SMS_MODEL || "gpt-4.1",
    anthropicModel = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
  } = params;

  let anthropicError: unknown = null;

  // Primary: Anthropic (Claude) — ask for JSON in the system prompt
  try {
    const jsonSystem = (system ? system + "\n\n" : "") + "Respond with valid JSON only. No markdown, no explanation.";
    const response = await anthropic.messages.create({
      model: anthropicModel,
      max_tokens: maxTokens,
      system: jsonSystem,
      messages: [{ role: "user", content: user }],
    });

    const text = extractAnthropicText(response.content as Array<{ type: string; text?: string }>);
    if (text) {
      // Validate it's parseable JSON
      JSON.parse(text);
      return text;
    }
    throw new Error("Anthropic returned empty JSON text");
  } catch (error) {
    anthropicError = error;
    console.error("[SMS-AI] Anthropic JSON request failed, falling back to OpenAI:", error);
  }

  // Fallback: OpenAI (has native JSON mode)
  try {
    const response = await openai.chat.completions.create({
      model: openaiModel,
      max_tokens: maxTokens,
      response_format: { type: "json_object" },
      messages: [
        ...(system ? [{ role: "system" as const, content: system }] : []),
        { role: "user" as const, content: user },
      ],
    });

    const text = response.choices[0]?.message?.content?.trim() || "";
    if (text) return text;
    throw new Error("OpenAI fallback returned empty JSON text");
  } catch (error) {
    console.error("[SMS-AI] OpenAI JSON fallback also failed:", error);
  }

  if (anthropicError) throw anthropicError;
  throw new Error("Both Anthropic and OpenAI failed for JSON");
}

export async function completeVisionTextOpenAIFirst(params: {
  system?: string;
  user: string;
  imageUrl: string;
  maxTokens?: number;
  openaiModel?: string;
  anthropicModel?: string;
}) {
  const {
    system,
    user,
    imageUrl,
    maxTokens = 500,
    openaiModel = process.env.OPENAI_SMS_VISION_MODEL || process.env.OPENAI_SMS_MODEL || "gpt-4.1",
    anthropicModel = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
  } = params;

  let anthropicError: unknown = null;

  // Primary: Anthropic (Claude) — supports image URLs directly
  try {
    const response = await anthropic.messages.create({
      model: anthropicModel,
      max_tokens: maxTokens,
      system,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "url",
                url: imageUrl,
              } as any,
            },
            {
              type: "text",
              text: user,
            },
          ],
        },
      ],
    });

    const text = extractAnthropicText(response.content as Array<{ type: string; text?: string }>);
    if (text) return text;
    throw new Error("Anthropic returned empty vision text");
  } catch (error) {
    anthropicError = error;
    console.error("[SMS-AI] Anthropic vision request failed, falling back to OpenAI:", error);
  }

  // Fallback: OpenAI — also supports image URLs
  try {
    const response = await openai.chat.completions.create({
      model: openaiModel,
      max_tokens: maxTokens,
      messages: [
        ...(system ? [{ role: "system" as const, content: system }] : []),
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: imageUrl },
            },
            {
              type: "text",
              text: user,
            },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message?.content?.trim() || "";
    if (text) return text;
    throw new Error("OpenAI fallback returned empty vision text");
  } catch (error) {
    console.error("[SMS-AI] OpenAI vision fallback also failed:", error);
  }

  if (anthropicError) throw anthropicError;
  throw new Error("Both Anthropic and OpenAI failed for vision");
}
