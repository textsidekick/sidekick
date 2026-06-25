import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function GET(request: NextRequest) {
  const companyId = request.nextUrl.searchParams.get("companyId") || "default";
  
  const { data: gaps, error } = await supabase
    .from("knowledge_gaps")
    .select("*")
    .eq("company_id", companyId)
    .order("priority", { ascending: false });

  if (error) {
    console.error("Error fetching gaps:", error);
    return NextResponse.json({ gaps: [] });
  }

  return NextResponse.json({ gaps: gaps || [] });
}

export async function POST(request: NextRequest) {
  try {
    const { unansweredQuestions, companyId } = await request.json();

    if (!unansweredQuestions || unansweredQuestions.length === 0) {
      return NextResponse.json({ gaps: [] });
    }

    const questionsText = unansweredQuestions
      .map((q: any) => "- " + q.question + " (asked " + q.count + " times)")
      .join("\n");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: `Analyze these unanswered workplace questions and identify knowledge gaps. Group similar questions and suggest policies.

Questions:
${questionsText}

Return a JSON array with this structure:
[{
  "topic": "parking|schedule|safety|compensation|benefits|breaks|dress_code|contacts|training|general",
  "cluster": ["question1", "question2"],
  "suggestedPolicy": "A clear policy statement that would answer these questions",
  "priority": 1-100,
  "frequency": total_times_asked
}]

Only return the JSON array, no other text.`
      }]
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "[]";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    
    let gaps = [];
    try {
      gaps = JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse gaps:", e);
      return NextResponse.json({ gaps: [] });
    }

    // Save gaps to Supabase
    for (const gap of gaps) {
      const { error } = await supabase.from("knowledge_gaps").upsert({
        id: companyId + "-" + gap.topic + "-" + Date.now(),
        company_id: companyId,
        topic: gap.topic,
        cluster: gap.cluster,
        suggested_policy: gap.suggestedPolicy,
        priority: gap.priority,
        frequency: gap.frequency,
        unique_workers: gap.cluster.length,
        trend: "new",
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("Error saving gap:", error);
      }
    }

    return NextResponse.json({ gaps });

  } catch (error) {
    console.error("Gap analysis error:", error);
    return NextResponse.json({ error: "Failed to analyze gaps" }, { status: 500 });
  }
}
