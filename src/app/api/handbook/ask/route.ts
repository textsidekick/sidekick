import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const FALLBACK_HANDBOOK = `
PARKING: Employees park in Lot B behind the building. Visitor parking is in front.
WORK HOURS: Shift starts at 8:00 AM. Please arrive 10 minutes early to clock in.
DRESS CODE: Safety shoes and company uniform required on the factory floor.
BREAK ROOM: Located on the second floor. Microwave and coffee available.
TIME CLOCK: Use your badge to clock in/out at the entrance. If you forget your badge, see your supervisor.
SAFETY: Hard hats required in manufacturing areas. Report all accidents to your supervisor immediately.
`;

function chunk(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];
  for (let i = 0; i < clean.length; i += 1200) chunks.push(clean.slice(i, i + 1200));
  return chunks.slice(0, 5);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const question = String(body?.question ?? "").trim();

    if (!question) {
      return NextResponse.json({ ok: false, error: "Missing question" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ ok: false, error: "Missing API key" }, { status: 500 });
    }

    const chunks = chunk(FALLBACK_HANDBOOK);
    const context = chunks.map((c, i) => `SOURCE ${i + 1}: ${c}`).join("\n\n");

    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 300,
      system: "You are Sidekick, an onboarding assistant. Answer using ONLY the provided sources. If not in sources, say: 'I'm not sure based on the handbook. Please ask your manager.' Keep it under 2 sentences.",
      messages: [{
        role: "user",
        content: `Question: ${question}\n\nSources:\n${context}`
      }]
    });

    const answer = response.content?.[0]?.type === "text"
      ? response.content[0].text.trim()
      : "I'm not sure based on the handbook. Please ask your manager.";

    return NextResponse.json({ ok: true, answer });
  } catch (e: any) {
    console.error("Ask route error:", e);
    return NextResponse.json(
      { ok: false, error: "Ask failed", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
