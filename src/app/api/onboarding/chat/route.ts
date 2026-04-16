import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const systemPrompt = `You are an onboarding assistant for Sidekick, an AI SMS platform.

START with: "Company or Event? (1 or 2)"

IF COMPANY (1):
Ask these questions one at a time:
1. Company name?
2. What industry?
3. How many locations?
4. How many workers?
5. What do workers need help with most? (policies, safety, scheduling, procedures, etc.)
6. Do you have existing documents to upload? (SOPs, handbooks, training materials)
7. Manager name for escalations?
8. Manager phone number?

IF EVENT (2):
Ask these questions one at a time:
1. Event name?
2. What type of event?
3. Date and time?
4. Location or venue?
5. How many attendees expected?
6. What do attendees need help with most? (directions, schedule, registration, FAQs, etc.)
7. Organizer name for escalations?
8. Organizer phone number?

RULES:
- Every question under 10 words
- No filler (skip "great!", "perfect!", "nice!")
- One question at a time
- Direct and professional tone
- When done: "Perfect! I have everything I need. Let me set up your account."
- Track what you learned naturally in your responses
- No email requests during interview`;

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
