import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { runPlantHealthCheck } from "@/lib/predictive-maintenance";

export async function GET(request: NextRequest) {
  // Auth check
  const secret = request.nextUrl.searchParams.get("secret") || request.headers.get("x-cron-secret");
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    // Get all active companies
    const { data: companies } = await supabase
      .from("companies")
      .select("id, name")
      .limit(100);

    if (!companies || companies.length === 0) {
      return NextResponse.json({ message: "no companies found" });
    }

    const results: any[] = [];

    for (const company of companies) {
      try {
        const report = await runPlantHealthCheck(company.id);

        // Update asset health scores in DB
        for (const assetScore of report.assetScores) {
          await supabase
            .from("assets")
            .update({ health_score: assetScore.score, updated_at: new Date().toISOString() })
            .eq("id", assetScore.assetId);
        }

        // Auto-create preventive work orders for high-risk assets
        let preventiveWOsCreated = 0;
        for (const prediction of report.predictions) {
          if (prediction.probability > 0.7) {
            const { error } = await supabase.from("work_orders").insert({
              company_id: company.id,
              asset_id: prediction.assetId,
              title: `[PREDICTIVE] ${prediction.prediction}`,
              description: `AI-generated preventive work order. ${prediction.assetName} has a ${Math.round(prediction.probability * 100)}% probability of failure within ${prediction.timeframe}. Recommended: inspect and address proactively.`,
              priority: prediction.probability > 0.85 ? "high" : "medium",
              status: "open",
              category: "preventive",
              source: "ai_generated",
              ai_triage: { type: "predictive", probability: prediction.probability, timeframe: prediction.timeframe },
            });
            if (!error) preventiveWOsCreated++;
          }
        }

        results.push({
          companyId: company.id,
          companyName: company.name,
          overallScore: report.overallScore,
          assetsChecked: report.assetScores.length,
          predictionsGenerated: report.predictions.length,
          preventiveWOsCreated,
          pmOptimizations: report.pmOptimizations.length,
        });
      } catch (err) {
        console.error(`[health-check] Error for company ${company.id}:`, err);
        results.push({ companyId: company.id, error: String(err) });
      }
    }

    return NextResponse.json({ success: true, companiesProcessed: results.length, results });
  } catch (error) {
    console.error("[health-check] Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
