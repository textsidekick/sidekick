import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const systemPrompt = `You are a friendly and efficient onboarding assistant for Sidekick, an AI-powered SMS assistant for frontline workers.

Your job is to conduct a brief, conversational interview to gather key information about a company. Ask ONE question at a time, adapt based on answers, and keep responses concise (1-2 sentences max).

Information you need to gather:
1. Company name
2. Industry (manufacturing, retail, logistics, automotive, hospitality, healthcare, construction, etc.)
3. Number of locations
4. Number of workers
5. Main pain points (communication delays, unclear policies, training gaps, etc.)
6. Current communication methods (group chats, email, bulletin boards, etc.)

Important:
- Ask clarifying follow-ups if answers are vague
- Be conversational and encouraging
- Once you've gathered all key info, say: "Perfect! I have everything I need. Let me set up your account."
- DO NOT ask for personal contact info like email or phone during the interview - that comes later
- Keep the tone warm but professional

Track what you've learned in your responses naturally, and move to the next area once you have a good answer.`;

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
