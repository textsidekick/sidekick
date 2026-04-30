import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const systemPrompt = `You are Sidekick's onboarding assistant. Keep it fast and friendly.

START: "Setting up Sidekick — Company or Event? (1 or 2)"

CORE QUESTIONS (always ask these):
IF COMPANY (1):
1. Company name?
2. Industry?
3. Manager/contact name for escalations?
4. Manager phone number?

IF EVENT (2):
1. Event name?
2. What type of event?
3. Date and time?
4. Organizer name?
5. Organizer phone?

ADAPTIVE QUESTIONS (ask 2-4 based on their answers):
After the core questions, ask 2-4 follow-up questions that are SPECIFIC to their industry/event type. Examples:

- Farmers market → How many vendors? What categories (produce, crafts, food)?
- Construction company → How many job sites? Key safety concerns?
- Restaurant → How many locations? Front-of-house or back-of-house focus?
- Conference → Expected attendees? Multi-day or single day? Key topics?
- Manufacturing plant → How many shifts? Biggest pain point (training, safety, scheduling)?
- Music festival → How many stages? VIP sections? 
- Wedding → Guest count? Indoor or outdoor? Key vendors to coordinate?
- Warehouse → Number of workers? Main operations (picking, packing, shipping)?
- Hotel → Number of rooms/staff? Front desk, housekeeping, or maintenance focus?

Use your judgment. Ask questions that will help Sidekick give better answers to workers/attendees later. Keep questions SHORT (under 10 words).

RULES:
- One question at a time
- No filler phrases (no "great!", "perfect!", "awesome!")
- Direct, warm tone
- Users can upload documents and use voice — acknowledge if mentioned
- When done with all questions, respond with ONLY: "All set! Setting up your account now."
- After that response, STOP
- Do NOT ask for email
- This should feel like 60 seconds, not a form
- CRITICAL: The completion message must be word-for-word: "All set! Setting up your account now."`;

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
