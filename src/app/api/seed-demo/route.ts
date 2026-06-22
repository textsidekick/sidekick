import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== "seed-sidekick-demo-2026") {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    // Get or create company
    let { data: companies } = await supabase.from("companies").select("id, name").limit(1);
    let companyId: string;

    if (companies && companies.length > 0) {
      companyId = companies[0].id;
    } else {
      return NextResponse.json({ error: "no company found — create one in the dashboard first" });
    }

    // Create assets
    const assets = [
      { company_id: companyId, name: "CNC Mill 1", asset_tag: "CNC-001", type: "cnc_mill", manufacturer: "HAAS", model: "VF-2SS", location: "Bay 1, Line 1", status: "operational", health_score: 92 },
      { company_id: companyId, name: "CNC Mill 2", asset_tag: "CNC-002", type: "cnc_mill", manufacturer: "HAAS", model: "VF-4", location: "Bay 2, Line 1", status: "degraded", health_score: 68 },
      { company_id: companyId, name: "Conveyor Line 1", asset_tag: "CVR-001", type: "conveyor", manufacturer: "Dorner", model: "3200 Series", location: "Line 1", status: "operational", health_score: 95 },
      { company_id: companyId, name: "Conveyor Line 3", asset_tag: "CVR-003", type: "conveyor", manufacturer: "Dorner", model: "3200 Series", location: "Line 3", status: "down", health_score: 35 },
      { company_id: companyId, name: "Hydraulic Press 1", asset_tag: "HYD-001", type: "press", manufacturer: "Beckwood", model: "4-Post 200T", location: "Bay 4", status: "operational", health_score: 88 },
      { company_id: companyId, name: "Packaging Machine A", asset_tag: "PKG-001", type: "packaging", manufacturer: "Bosch", model: "CUC 3001", location: "Packaging Area", status: "operational", health_score: 78 },
      { company_id: companyId, name: "Welding Station 2", asset_tag: "WLD-002", type: "welder", manufacturer: "Lincoln", model: "Power MIG 360MP", location: "Welding Bay", status: "degraded", health_score: 55 },
    ];

    const { data: insertedAssets, error: assetErr } = await supabase.from("assets").insert(assets).select("id, name, asset_tag");
    if (assetErr) return NextResponse.json({ error: "failed to create assets", detail: assetErr.message });

    const assetMap: Record<string, string> = {};
    for (const a of insertedAssets || []) {
      assetMap[a.asset_tag] = a.id;
    }

    // Create work orders
    const now = new Date();
    const hoursAgo = (h: number) => new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();
    const daysAgo = (d: number) => new Date(now.getTime() - d * 24 * 60 * 60 * 1000).toISOString();

    const workOrders = [
      // Completed
      { company_id: companyId, asset_id: assetMap["CNC-001"], asset_name: "CNC Mill 1", title: "Coolant pump replaced", priority: "medium", status: "completed", category: "mechanical", source: "sms", actual_time_minutes: 95, started_at: daysAgo(3), completed_at: daysAgo(3), resolution_notes: "Replaced coolant pump. Old pump was cavitating due to worn impeller. Flushed entire coolant system.", created_at: daysAgo(3) },
      { company_id: companyId, asset_id: assetMap["CVR-001"], asset_name: "Conveyor Line 1", title: "Belt tension adjustment", priority: "low", status: "completed", category: "mechanical", source: "sms", actual_time_minutes: 25, started_at: daysAgo(2), completed_at: daysAgo(2), resolution_notes: "Adjusted belt tension on drive side. Was slipping under load.", created_at: daysAgo(2) },
      { company_id: companyId, asset_id: assetMap["HYD-001"], asset_name: "Hydraulic Press 1", title: "Hydraulic fitting leak — repaired", priority: "high", status: "completed", category: "hydraulic", source: "sms", actual_time_minutes: 65, started_at: daysAgo(1), completed_at: daysAgo(1), resolution_notes: "Replaced leaking fitting on return line. Topped off fluid. Checked pressure — reading normal at 1520 PSI.", created_at: daysAgo(1) },

      // In progress
      { company_id: companyId, asset_id: assetMap["CNC-002"], asset_name: "CNC Mill 2", title: "Spindle vibration — investigating", priority: "high", status: "in_progress", category: "mechanical", source: "sms", estimated_time_minutes: 120, started_at: hoursAgo(2), created_at: hoursAgo(3) },
      { company_id: companyId, asset_id: assetMap["CVR-003"], asset_name: "Conveyor Line 3", title: "Drive motor failure — replacing", priority: "critical", status: "in_progress", category: "electrical", source: "sms", estimated_time_minutes: 180, started_at: hoursAgo(4), created_at: hoursAgo(5) },
      { company_id: companyId, asset_id: assetMap["WLD-002"], asset_name: "Welding Station 2", title: "Wire feed mechanism jamming", priority: "medium", status: "in_progress", category: "mechanical", source: "sms", estimated_time_minutes: 60, started_at: hoursAgo(1), created_at: hoursAgo(2) },

      // Open/Assigned
      { company_id: companyId, asset_id: assetMap["PKG-001"], asset_name: "Packaging Machine A", title: "Seal bar temperature inconsistent", priority: "medium", status: "open", category: "electrical", source: "sms", estimated_time_minutes: 45, created_at: hoursAgo(1) },
      { company_id: companyId, asset_id: assetMap["CNC-002"], asset_name: "CNC Mill 2", title: "Tool changer alignment off — parts scrapping", priority: "critical", status: "open", category: "quality", source: "sms", estimated_time_minutes: 90, created_at: hoursAgo(0.5) },
      { company_id: companyId, asset_id: assetMap["HYD-001"], asset_name: "Hydraulic Press 1", title: "Pressure gauge reading low — 1420 PSI", priority: "low", status: "assigned", category: "hydraulic", source: "pm_schedule", estimated_time_minutes: 30, created_at: daysAgo(1) },

      // AI-generated predictive
      { company_id: companyId, asset_id: assetMap["CNC-002"], asset_name: "CNC Mill 2", title: "[PREDICTIVE] Spindle bearing failure likely within 21 days", priority: "high", status: "open", category: "preventive", source: "ai_generated", estimated_time_minutes: 240, created_at: hoursAgo(6), ai_triage: { type: "predictive", probability: 0.82, timeframe: "21 days" } },
    ];

    const { error: woErr } = await supabase.from("work_orders").insert(workOrders);
    if (woErr) return NextResponse.json({ error: "failed to create work orders", detail: woErr.message });

    // Parts inventory
    const parts = [
      { company_id: companyId, name: "6205-2RS Bearing", part_number: "BRG-6205", location: "Parts Cage B, Shelf 3", quantity_on_hand: 4, reorder_point: 2, unit_cost: 12.50, supplier: "McMaster-Carr" },
      { company_id: companyId, name: "Conveyor Belt 3200 Series", part_number: "CVB-3200", location: "Parts Cage C, Shelf 1", quantity_on_hand: 1, reorder_point: 1, unit_cost: 485.00, supplier: "Dorner Parts" },
      { company_id: companyId, name: "Hydraulic Fitting 1/2\" NPT", part_number: "HYD-FIT-12", location: "Parts Cage A, Shelf 5", quantity_on_hand: 12, reorder_point: 5, unit_cost: 8.75, supplier: "Parker Hannifin" },
      { company_id: companyId, name: "Coolant Pump Assembly", part_number: "CNC-PUMP-01", location: "Parts Cage D", quantity_on_hand: 0, reorder_point: 1, unit_cost: 325.00, supplier: "HAAS Parts" },
    ];

    const { error: partsErr } = await supabase.from("parts_inventory").insert(parts);
    if (partsErr) return NextResponse.json({ error: "failed to create parts", detail: partsErr.message });

    // PM Schedules
    const pmSchedules = [
      { company_id: companyId, asset_id: assetMap["CNC-001"], title: "Monthly CNC Mill 1 Inspection", description: "Full monthly inspection", checklist: ["Check coolant level and condition", "Inspect spindle runout", "Check way covers", "Lubricate ball screws", "Inspect chip conveyor", "Check hydraulic pressure"], frequency_type: "calendar", frequency_value: 30, next_due_at: daysAgo(-5), status: "active" },
      { company_id: companyId, asset_id: assetMap["HYD-001"], title: "Weekly Hydraulic Press Check", description: "Weekly pressure and leak inspection", checklist: ["Check hydraulic pressure (spec: 1500 PSI ± 50)", "Inspect all fittings for leaks", "Check fluid level", "Inspect safety guards"], frequency_type: "calendar", frequency_value: 7, next_due_at: daysAgo(-2), status: "active" },
      { company_id: companyId, asset_id: assetMap["CVR-001"], title: "Bi-weekly Conveyor Belt Inspection", description: "Belt condition and alignment check", checklist: ["Check belt tension", "Inspect belt for wear/damage", "Check roller alignment", "Lubricate bearings"], frequency_type: "calendar", frequency_value: 14, next_due_at: daysAgo(-10), status: "active" },
    ];

    const { error: pmErr } = await supabase.from("pm_schedules").insert(pmSchedules);
    if (pmErr) return NextResponse.json({ error: "failed to create PM schedules", detail: pmErr.message });

    return NextResponse.json({
      success: true,
      companyId,
      created: {
        assets: (insertedAssets || []).length,
        workOrders: workOrders.length,
        parts: parts.length,
        pmSchedules: pmSchedules.length,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: "exception", message: e.message?.slice(0, 300) });
  }
}
