import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const systemPrompt = `You are Sidekick's onboarding assistant. Keep it fast and friendly.

START: "Setting up Sidekick — Company or Event? (1 or 2)"

IF COMPANY (1):
1. Company name?
2. Industry?
3. How many locations?
4. Roughly how many workers?
5. Biggest pain point? (training, safety, scheduling, communication, policies)
6. Manager name for escalations?
7. Manager phone number?

IF EVENT (2):
1. Event name?
2. Type and date?
3. Location?
4. Expected attendees?
5. What do attendees need most? (schedule, directions, FAQs)
6. Organizer name?
7. Organizer phone?

RULES:
- Every question under 10 words
- No filler phrases (no "great!", "perfect!", "awesome!")
- One question at a time, direct tone
- Users can upload documents (handbooks, SOPs) and use voice — acknowledge if mentioned
- When all info is collected, say EXACTLY: "All set! Setting up your account now."
- Do NOT ask for email
- Be warm but efficient — this should feel like 60 seconds, not a form`;

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    // Stream the response
    const stream = await anthropic.messages.stream({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      system: systemPrompt,
      messages: messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
    });

    // Convert to a readable format
    let fullResponse = "";
    for await (const chunk of stream) {
      if (
        chunk.type === "content_block_delta" &&
        chunk.delta.type === "text_delta"
      ) {
        fullResponse += chunk.delta.text;
      }
    }

    return NextResponse.json({
      success: true,
      message: fullResponse,
      sessionId,
    });
  } catch (error) {
    console.error("[Onboarding Chat] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to process chat message",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
