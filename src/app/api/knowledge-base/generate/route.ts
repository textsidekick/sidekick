export const maxDuration = 60;
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, rateLimitKey } from "@/lib/rate-limit";
import { supabase } from "@/lib/supabase";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const REPORT_PROMPTS: Record<string, string> = {
  "company-overview": "Generate a comprehensive company overview including company name, industry, size, key policies, and contact information. Format as structured sections with ## headings.",
  "employee-handbook": "Generate an employee handbook summary covering key policies, procedures, benefits, and expectations. Format with ## section headings and bullet points.",
  "faq": "Generate the top 15-20 questions that frontline workers would most likely ask, with clear answers based on the company data. Format as Q&A pairs with ## headings.",
  "safety-procedures": "Extract and organize all safety procedures, compliance requirements, PPE requirements, and emergency protocols. Format with ## section headings.",
  "onboarding-guide": "Generate a new hire onboarding guide with step-by-step instructions for the first day, first week, and first month. Include key contacts and resources. Format with ## headings.",
};

export async function POST(request: NextRequest) {
  const _rl = checkRateLimit(rateLimitKey("api", request as any), 5);
  if (!_rl.allowed) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  try {
    const { companyId, reportType, customPrompt } = await request.json();
    if (!companyId || !reportType) {
      return NextResponse.json({ error: "companyId and reportType required" }, { status: 400 });
    }

    const { data: company } = await supabase.from("companies").select("*").eq("id", companyId).single();
    const { data: docs } = await supabase.from("documents").select("id, filename, type, content").eq("company_id", companyId).limit(20);
    const { data: chunks } = await supabase.from("document_chunks").select("title, content, source").eq("company_id", companyId).limit(50);

    const context = [
      company ? `Company: ${company.company_name || "Unknown"}\nIndustry: ${company.industry || "Unknown"}\nSize: ${company.employee_count || "Unknown"} employees\nDetails: ${JSON.stringify(company)}` : "",
      ...(docs || []).map((d: any) => `Document "${d.filename}": ${(d.content || "").slice(0, 2000)}`),
      ...(chunks || []).map((c: any) => `[${c.source || "doc"}] ${c.title || ""}: ${(c.content || "").slice(0, 1000)}`),
    ].filter(Boolean).join("\n\n");

    const prompt = reportType === "custom"
      ? (customPrompt || "Generate a general company report.")
      : (REPORT_PROMPTS[reportType] || REPORT_PROMPTS["company-overview"]);

    const response = await openai.chat.completions.create({
      model: "gpt-4.1",
      max_tokens: 4096,
      messages: [
        { role: "system", content: "You are a professional report generator for Sidekick, a B2B knowledge base platform. Generate well-structured, professional reports based on the company data provided. Use markdown formatting with ## for section headings, bullet points, and **bold** text. Be specific and actionable. If data is limited, note what additional information would improve the report." },
        { role: "user", content: `Company data:\n${context || "No data imported yet."}\n\nTask: ${prompt}` }
      ],
    });

    const content = response.choices[0]?.message?.content || "Could not generate report.";

    return NextResponse.json({
      success: true,
      title: reportType.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase()),
      content,
      reportType,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[Generate Report] Error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
