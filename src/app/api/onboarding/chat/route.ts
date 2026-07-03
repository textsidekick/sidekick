export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const systemPrompt = `You are Sidekick's onboarding assistant. You're sharp, intuitive, and efficient.

YOUR GOAL: Gather enough information that Sidekick can answer ANY question a frontline worker might text in. Think like a journalist — every answer they give should spark a smarter follow-up.

OPENER: "Hey! Let's get Sidekick set up for your team. What's your company name?"

CORE QUESTIONS (always ask):
1. Company name
2. What does your company do? (industry/type)
3. How many workers/employees?
4. Who should Sidekick escalate to when it can't answer? (name + phone)

THEN: THE SMART PART

After each answer, THINK about:
1. "If I were a frontline worker here, what would I text Sidekick about?"
2. "What information gap would cause the most confusion?"
3. "What does their previous answer imply I should ask next?"

DO NOT follow a script. Generate your next question dynamically based on EVERYTHING they have told you so far.

AFTER 3-5 ADAPTIVE QUESTIONS, ASK ABOUT INTEGRATIONS:
"Where does your company keep its documents and knowledge? We can connect directly to pull everything in."
[suggestions: Google Drive | SharePoint | Notion | Dropbox | Slack | Other]

Then: "Any other tools your team uses daily?"
[suggestions: QuickBooks | ADP | Salesforce | Procore | Airtable | Monday.com | None]

ALWAYS END WITH:
- "What's the #1 question your workers ask you the most?"
- "What do you wish everyone just knew without asking?"

For each question, briefly explain why: "(so Sidekick can answer parking questions)"

SUGGESTIONS: Provide 2-4 clickable options after each question:
[suggestions: option1 | option2 | option3]

PROGRESS: Show "(3/8)" at the start.

RULES:
- ONE question per message, max 2 sentences
- No filler words
- Be warm but move fast
- This is B2B only — companies with frontline/deskless workers
- When done: "All set! Setting up your account now."
- CRITICAL: completion message must be word-for-word: "All set! Setting up your account now."`;

const extractionPrompt = `Extract any structured data from this onboarding conversation. Return a JSON object with ONLY the fields that have been explicitly mentioned. Do not guess or infer.

Possible fields:
{
  "company": { "name": "", "industry": "", "location": "", "phone": "", "email": "", "employeeCount": "", "shifts": "" },
  "assets": [{ "name": "", "type": "", "location": "" }],
  "team": [{ "name": "", "role": "", "phone": "" }],
  "knowledge": [{ "name": "", "type": "sop|manual|safety|other" }],
  "workorders": [{ "title": "", "status": "open|in_progress|complete", "priority": "low|medium|high" }],
  "integrations": [{ "name": "", "status": "connected|pending" }]
}

Only include sections where data was explicitly provided. Return {} if nothing extractable yet. Return ONLY valid JSON, no explanation.`;

export async function POST(request: NextRequest) {
  try {
    const { messages, sessionId, section } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    // Stream the response
    const stream = await anthropic.messages.stream({
      model: "claude-opus-4-8",
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

    // Extract structured data from conversation (lightweight call)
    let extractedData = null;
    try {
      const extractionRes = await anthropic.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 512,
        system: extractionPrompt,
        messages: [
          ...messages.map((msg: any) => ({ role: msg.role, content: msg.content })),
          { role: "assistant", content: fullResponse },
        ].map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      });
      const extractionText = extractionRes.content[0].type === "text" ? extractionRes.content[0].text : "";
      const jsonMatch = extractionText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error("[Extraction] Non-critical error:", e);
    }

    // Detect completion: the system prompt requires this exact phrase when done
    const isDone =
      fullResponse.includes("All set! Setting up your account now") ||
      (fullResponse.includes("All set") && fullResponse.includes("setting up")) ||
      fullResponse.includes("Perfect! I have everything I need");

    return NextResponse.json({
      success: true,
      message: fullResponse,
      extractedData,
      sessionId,
      done: isDone,
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
