import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "companyId required" }, { status: 400 });
  }

  try {
    // Get interactions where Sidekick couldn't answer well
    const { data: interactions } = await supabase
      .from("interactions")
      .select("*")
      .eq("company_id", companyId)
      .or("unanswered.eq.true,confidence_score.lt.0.5")
      .order("created_at", { ascending: false })
      .limit(50);

    // Group similar questions
    const gaps: Record<string, { question: string; count: number; lastAsked: string; examples: string[] }> = {};
    
    for (const i of interactions || []) {
      const q = (i.question || i.message || "").toLowerCase().trim();
      if (!q) continue;
      
      // Simple grouping by first 50 chars
      const key = q.slice(0, 50);
      if (!gaps[key]) {
        gaps[key] = { question: i.question || i.message, count: 0, lastAsked: i.created_at, examples: [] };
      }
      gaps[key].count++;
      if (gaps[key].examples.length < 3) {
        gaps[key].examples.push(i.question || i.message);
      }
    }

    const sortedGaps = Object.values(gaps)
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return NextResponse.json({
      totalGaps: interactions?.length || 0,
      gaps: sortedGaps,
    });
  } catch (error) {
    console.error("[Knowledge Gaps] Error:", error);
    return NextResponse.json({ error: "Failed to fetch knowledge gaps" }, { status: 500 });
  }
}
