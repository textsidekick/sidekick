import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { companyId } = await request.json();
    if (!companyId) {
      return NextResponse.json({ error: "companyId required" }, { status: 400 });
    }

    // Get company info
    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("id", companyId)
      .single();

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Get recent interactions (last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: interactions } = await supabase
      .from("interactions")
      .select("*")
      .eq("company_id", companyId)
      .gte("created_at", weekAgo)
      .order("created_at", { ascending: false });

    const totalQuestions = interactions?.length || 0;

    // Get unanswered/low-confidence questions
    const gaps = (interactions || []).filter((i: any) =>
      i.confidence_score < 0.5 || i.unanswered === true
    );

    // Get language breakdown
    const languages: Record<string, number> = {};
    for (const i of interactions || []) {
      const lang = i.language || "English";
      languages[lang] = (languages[lang] || 0) + 1;
    }

    // Get top question categories
    const categories: Record<string, number> = {};
    for (const i of interactions || []) {
      const cat = i.category || "General";
      categories[cat] = (categories[cat] || 0) + 1;
    }

    // Generate digest with AI
    const context = {
      companyName: company.company_name,
      totalQuestions,
      gapCount: gaps.length,
      topGaps: gaps.slice(0, 5).map((g: any) => g.question || g.message),
      languages,
      topCategories: Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 5),
    };

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1024,
      system: "Generate a concise, professional weekly email digest for a company manager. Use plain text, no markdown. Keep it under 200 words. Be specific with numbers. End with 1-2 actionable suggestions.",
      messages: [{
        role: "user",
        content: `Weekly digest data for ${context.companyName}:\n- Total questions from workers: ${context.totalQuestions}\n- Unanswered questions: ${context.gapCount}\n- Top unanswered: ${context.topGaps.join(", ") || "None"}\n- Languages used: ${JSON.stringify(context.languages)}\n- Top categories: ${JSON.stringify(context.topCategories)}\n\nGenerate the email digest.`,
      }],
    });

    const digestContent = response.content[0].type === "text" ? response.content[0].text : "";

    // Send via email if manager has email
    const managerEmail = company.manager_email || company.email;
    if (managerEmail) {
      const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
      const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;

      // For now, store the digest - email sending can be added with SendGrid/Resend later
      await supabase.from("digests").insert({
        company_id: companyId,
        content: digestContent,
        stats: context,
        created_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      digest: digestContent,
      stats: context,
    });
  } catch (error) {
    console.error("[Digest] Error:", error);
    return NextResponse.json({ error: "Failed to generate digest" }, { status: 500 });
  }
}
