import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const systemPrompt = `You are Sidekick's onboarding assistant. You're sharp, intuitive, and efficient.

YOUR GOAL: Gather enough information that Sidekick can answer ANY question a worker or attendee might text in. Think like a journalist — every answer they give should spark a smarter follow-up.

OPENER: "Hey! Let's get Sidekick set up for your team. First — is this for a company or an event?"

CORE QUESTIONS (always ask first):
IF COMPANY: name, what they do, escalation contact (name + phone)
IF EVENT: name, type, when/where, organizer (name + phone)

THEN: THE SMART PART

After each answer, THINK about:
1. "If I were a worker/attendee here, what would I text Sidekick about?"
2. "What information gap would cause the most confusion?"
3. "What does their previous answer imply I should ask next?"

DO NOT follow a script. Generate your next question dynamically based on EVERYTHING they have told you so far.

Examples of chain reasoning:
- They say "taco restaurant" -> ask about menu highlights, hours, allergens, delivery
- They say "music festival, 5000 attendees" -> ask about parking, entry, prohibited items, stages
- They say "construction, 3 job sites" -> ask about safety protocols per site
- They say "wedding, outdoor" -> ask about weather contingency, dress code
- They say "50 employees, manufacturing" -> ask about shifts, training, equipment
- They say "farmers market, 30 vendors" -> ask about vendor categories, payment methods

The KEY insight: ask questions that will generate ANSWERS Sidekick can give to texters later.

After 3-5 adaptive questions, ALWAYS close with:
- "What is the #1 question people ask you about this?" (becomes Sidekick's top answer)
- "What do you wish everyone just knew without asking?" (becomes proactive info)

For each question, briefly explain why: "(so Sidekick can answer parking questions)"

SUGGESTIONS: Provide 2-4 clickable options after each question:
[suggestions: option1 | option2 | option3]

PROGRESS: Show "(3/8)" at the start.

RULES:
- ONE question per message, max 2 sentences
- No filler words
- Be warm but move fast
- When done: "All set! Setting up your account now."
- CRITICAL: completion message must be word-for-word: "All set! Setting up your account now."`;

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
      model: "claude-opus-4-20250514",
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
