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

  let openAiError: unknown = null;

  // Primary: OpenAI
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
    console.error("[SMS-AI] OpenAI text request failed, falling back to Claude:", error);
  }

  // Fallback: Claude
  try {
    const response = await anthropic.messages.create({
      model: anthropicModel,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    });

    const text = extractAnthropicText(response.content as Array<{ type: string; text?: string }>);
    if (text) return text;
  } catch (error) {
    console.error("[SMS-AI] Claude fallback also failed:", error);
  }

  if (openAiError) throw openAiError;
  throw new Error("Both OpenAI and Claude failed");
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

  let openAiError: unknown = null;

  // Primary: OpenAI (has native JSON mode)
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
    console.error("[SMS-AI] OpenAI JSON request failed, falling back to Claude:", error);
  }

  // Fallback: Claude
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
      JSON.parse(text); // validate
      return text;
    }
  } catch (error) {
    console.error("[SMS-AI] Claude JSON fallback also failed:", error);
  }

  if (openAiError) throw openAiError;
  throw new Error("Both OpenAI and Claude failed for JSON");
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

  let openAiError: unknown = null;

  // Primary: OpenAI
  try {
    const messages: any[] = [
      ...(system ? [{ role: "system", content: system }] : []),
      {
        role: "user",
        content: [
          { type: "image_url", image_url: { url: imageUrl } },
          { type: "text", text: user },
        ],
      },
    ];

    const response = await openai.chat.completions.create({
      model: openaiModel,
      max_tokens: maxTokens,
      messages,
    });

    const text = response.choices[0]?.message?.content?.trim() || "";
    if (text) return text;
    throw new Error("OpenAI returned empty vision text");
  } catch (error) {
    openAiError = error;
    console.error("[SMS-AI] OpenAI vision request failed, falling back to Claude:", error);
  }

  // Fallback: Claude
  try {
    const response = await anthropic.messages.create({
      model: anthropicModel,
      max_tokens: maxTokens,
      system,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "url", url: imageUrl } },
            { type: "text", text: user },
          ],
        },
      ],
    });

    const text = extractAnthropicText(response.content as Array<{ type: string; text?: string }>);
    if (text) return text;
  } catch (error) {
    console.error("[SMS-AI] Claude vision fallback also failed:", error);
  }

  if (openAiError) throw openAiError;
  throw new Error("Both OpenAI and Claude failed for vision");
}
