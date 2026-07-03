import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  const { gap, companyName } = await request.json();
  if (!gap) return NextResponse.json({ error: "No gap provided" }, { status: 400 });

  const prompt = `Write a professional workplace policy for ${companyName || "the company"}.

Topic: ${gap.topic}
Employees asked: ${gap.cluster.join(", ")}
Suggestion: ${gap.suggestedPolicy}

Write a clear policy document with: title, purpose, rules, procedures, contact info. Under 400 words. Professional but accessible for blue-collar workers.`;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }]
    });
    const draft = response.content[0].type === "text" ? response.content[0].text : "";
    return NextResponse.json({ draft, topic: gap.topic });
  } catch (error) {
    return NextResponse.json({ error: "Draft generation failed" }, { status: 500 });
  }
}
