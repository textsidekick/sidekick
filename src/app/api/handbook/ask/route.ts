import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getDocumentsByCompany, getDocumentText } from "@/lib/documentClassifier";

export const runtime = "nodejs";

const FALLBACK_HANDBOOK = `
COMPANY HANDBOOK - DEMO

PARKING:
Employees park in Lot B behind the building. Visitor parking is in front.

WORK HOURS:
Shift starts at 8:00 AM. Please arrive 10 minutes early to clock in.

DRESS CODE:
Safety shoes and company uniform required on the factory floor.

BREAK ROOM:
Located on the second floor. Microwave and coffee available.

TIME CLOCK:
Use your badge to clock in/out at the entrance. If you forget your badge, see your supervisor.

SAFETY:
Hard hats required in manufacturing areas. Report all accidents to your supervisor immediately.
`;

function simpleChunks(text: string, size = 1200) {
  const clean = text.replace(/\s+/g, " ").trim();
  const chunks: string[] = [];
  for (let i = 0; i < clean.length; i += size) chunks.push(clean.slice(i, i + size));
  return chunks.slice(0, 200);
}

export async function POST(req: Request) {
  try {
    const { question = "" } = await req.json();
    const q = String(question).trim();
    if (!q) return NextResponse.json({ error: "Missing question" }, { status: 400 });

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing ANTHROPIC_API_KEY" }, { status: 500 });
    }

    const companyId = "demo";
    const documents = getDocumentsByCompany(companyId);
    
    let textToSearch = FALLBACK_HANDBOOK;
    let sources: any[] = [];
    
    if (documents.length > 0) {
      const docTexts = documents.map(d => getDocumentText(companyId, d.id));
      textToSearch = docTexts.join("\n\n");
      sources = documents.slice(0, 3).map(d => ({
        id: d.id,
        title: d.title,
        type: d.type
      }));
    }

    const chunks = simpleChunks(textToSearch);
    const context = chunks.slice(0, 10).map((c, i) => `SECTION ${i + 1}:\n${c}`).join("\n\n");

    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 400,
      system: `You are Sidekick, an onboarding assistant for hourly workers.
Answer questions using ONLY the provided document sections.
If the answer isn't in the documents, say: "I'm not sure based on the available documents. Please ask your manager."
Keep answers concise and practical.`,
      messages: [{
        role: "user",
        content: `Question: ${q}\n\nAvailable Documents:\n${context}`
      }]
    });

    const answer = response.content[0].type === "text"
      ? response.content[0].text
      : "I'm not sure based on the available documents.";

    return NextResponse.json({
      ok: true,
      answer,
      sources,
      documentsFound: documents.length
    });
  } catch (e: any) {
    console.error("Ask error:", e);
    return NextResponse.json(
      {
        error: "Ask failed",
        detail: String(e?.message ?? e),
        ok: false
      },
      { status: 500 }
    );
  }
}
