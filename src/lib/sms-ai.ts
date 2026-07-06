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
    anthropicModel = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
  } = params;

  let openAiError: unknown = null;

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
    throw new Error("OpenAI returned empty text");
  } catch (error) {
    openAiError = error;
    console.error("[SMS-AI] OpenAI text request failed:", error);
  }

  const response = await anthropic.messages.create({
    model: anthropicModel,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });

  const text = extractAnthropicText(response.content as Array<{ type: string; text?: string }>);
  if (text) return text;

  if (openAiError) throw openAiError;
  throw new Error("Anthropic fallback returned empty text");
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
    anthropicModel = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
  } = params;

  let openAiError: unknown = null;

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
    throw new Error("OpenAI returned empty JSON text");
  } catch (error) {
    openAiError = error;
    console.error("[SMS-AI] OpenAI JSON request failed:", error);
  }

  const response = await anthropic.messages.create({
    model: anthropicModel,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: user }],
  });

  const text = extractAnthropicText(response.content as Array<{ type: string; text?: string }>);
  if (text) return text;

  if (openAiError) throw openAiError;
  throw new Error("Anthropic fallback returned empty JSON text");
}

export async function completeVisionTextOpenAIFirst(params: {
  prompt: string;
  base64: string;
  mediaType: string;
  maxTokens?: number;
  openaiModel?: string;
  anthropicModel?: string;
}) {
  const {
    prompt,
    base64,
    mediaType,
    maxTokens = 500,
    openaiModel = process.env.OPENAI_SMS_VISION_MODEL || process.env.OPENAI_SMS_MODEL || "gpt-4.1",
    anthropicModel = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5",
  } = params;

  let openAiError: unknown = null;

  try {
    const response = await openai.chat.completions.create({
      model: openaiModel,
      max_tokens: maxTokens,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:${mediaType};base64,${base64}` },
            },
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message?.content?.trim() || "";
    if (text) return text;
    throw new Error("OpenAI returned empty vision text");
  } catch (error) {
    openAiError = error;
    console.error("[SMS-AI] OpenAI vision request failed:", error);
  }

  const response = await anthropic.messages.create({
    model: anthropicModel,
    max_tokens: maxTokens,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: toAnthropicImageMediaType(mediaType),
              data: base64,
            },
          },
          {
            type: "text",
            text: prompt,
          },
        ],
      },
    ],
  });

  const text = extractAnthropicText(response.content as Array<{ type: string; text?: string }>);
  if (text) return text;

  if (openAiError) throw openAiError;
  throw new Error("Anthropic fallback returned empty vision text");
}
