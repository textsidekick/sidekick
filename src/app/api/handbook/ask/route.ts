import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

// TEMP handbook (later replaced by uploaded PDFs)
const TEST_HANDBOOK = `
COMPANY HANDBOOK

PARKING:
Employees park in Lot B behind the building. Visitor parking is in front.

WORK HOURS:
Shifts start at 8:00 AM. Arrive 10 minutes early to clock in.

DRESS CODE:
Safety shoes and company uniform are required on the floor.

BREAK ROOM:
Second floor. Microwave and coffee available.

TIME CLOCK:
Use your badge at the main entrance.

SAFETY:
Hard hats required in manufacturing areas.
`;

function chunk(text: string, size = 1200) {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];
  for (let i = 0; i < clean.length; i += size) {
    chunks.push(clean.slice(i, i + size));
  }
  return chunks;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const question = String(body?.question ?? "").trim();

    if (!question) {
      return NextResponse.json(
        { ok: false, error: "Missing question" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "Missing ANTHROPIC_API_KEY" },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const sources = chunk(TEST_HANDBOOK).slice(0, 5);
    const context = sources
      .map((c, i) => `SOURCE ${i + 1}: ${c}`)
      .join("\n\n");

    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307", // ✅ SAFE + AVAILABLE
      max_tokens: 250,
      system:
        "You are Sidekick, an onboarding assistant for hourly workers. " +
        "Answer using ONLY the provided sources. " +
        "If the answer is not in the sources, say you are not sure and suggest asking a manager. " +
        "Keep answers short.",
      messages: [
        {
          role: "user",
          content: `Question: ${question}\n\nSources:\n${context}`,
        },
      ],
    });

    const answer =
      response.content?.[0]?.type === "text"
        ? response.content[0].text.trim()
        : "I’m not sure based on the handbook. Please ask your manager.";

    return NextResponse.json({ ok: true, answer });
  } catch (e: any) {
    console.error("Ask route error:", e);
    return NextResponse.json({
      ok: true, // IMPORTANT: UI never breaks
      answer:
        "Sorry — I’m having trouble answering right now. Please ask your manager.",
    });
  }
}