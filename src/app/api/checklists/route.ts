import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";

export async function GET(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const date = request.nextUrl.searchParams.get("date"); // Optional: filter by date

  try {
    let query = supabase
      .from("checklists")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (date) {
      query = query.eq("shift_date", date);
    }

    const { data: checklists, error } = await query.limit(100);

    if (error) {
      console.error("Checklists fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch checklists" }, { status: 500 });
    }

    // Get checklist templates for this company
    const { data: templates } = await supabase
      .from("checklist_templates")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    // Calculate stats
    const allChecklists = checklists || [];
    const today = new Date().toISOString().split('T')[0];
    const todayChecklists = allChecklists.filter(c => c.shift_date === today);
    
    const totalToday = todayChecklists.length;
    const passedToday = todayChecklists.filter(c => c.ppe_ok && c.loto_ok && c.equipment_ok).length;
    const failedToday = todayChecklists.filter(c => !c.ppe_ok || !c.loto_ok || !c.equipment_ok).length;
    
    // Breakdown by item
    const ppeFailures = allChecklists.filter(c => c.ppe_ok === false).length;
    const lotoFailures = allChecklists.filter(c => c.loto_ok === false).length;
    const equipmentFailures = allChecklists.filter(c => c.equipment_ok === false).length;

    // Get compliance by worker (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentChecklists = allChecklists.filter(c => new Date(c.created_at) >= sevenDaysAgo);
    
    const workerCompliance: Record<string, { name: string; total: number; passed: number }> = {};
    recentChecklists.forEach(c => {
      const key = c.worker_phone;
      if (!workerCompliance[key]) {
        workerCompliance[key] = { name: c.worker_name || "Unknown", total: 0, passed: 0 };
      }
      workerCompliance[key].total++;
      if (c.ppe_ok && c.loto_ok && c.equipment_ok) {
        workerCompliance[key].passed++;
      }
    });

    return NextResponse.json({
      checklists: allChecklists,
      templates: templates || [],
      stats: {
        totalToday,
        passedToday,
        failedToday,
        complianceRate: totalToday > 0 ? Math.round((passedToday / totalToday) * 100) : 100,
        ppeFailures,
        lotoFailures,
        equipmentFailures,
        workerCompliance: Object.values(workerCompliance),
      }
    });

  } catch (error) {
    console.error("Checklists error:", error);
    return NextResponse.json({ error: "Failed to fetch checklists" }, { status: 500 });
  }
}

// Create or update checklist template
export async function POST(request: NextRequest) {
  try {
    const { companyId, name, items } = await request.json();

    if (!companyId || !name || !items) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("checklist_templates")
      .insert({
        company_id: companyId,
        name,
        items, // JSON array of checklist items
        active: true,
      })
      .select()
      .single();

    if (error) {
      console.error("Template create error:", error);
      return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
    }

    return NextResponse.json({ success: true, template: data });

  } catch (error) {
    console.error("Template create error:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

// Update template or send checklist to workers
export async function PATCH(request: NextRequest) {
  try {
    const { action, templateId, companyId, workerPhones, items, active } = await request.json();

    // Update template items
    if (action === "update_template" && templateId) {
      const updates: any = {};
      if (items !== undefined) updates.items = items;
      if (active !== undefined) updates.active = active;

      const { data, error } = await supabase
        .from("checklist_templates")
        .update(updates)
        .eq("id", templateId)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
      }

      return NextResponse.json({ success: true, template: data });
    }

    // Send checklist to specific workers
    if (action === "send_checklist" && companyId && workerPhones?.length) {
      // Mark workers as having pending checklist
      const { error } = await supabase
        .from("workers")
        .update({ pending_checklist: true })
        .eq("company_id", companyId)
        .in("phone", workerPhones);

      if (error) {
        return NextResponse.json({ error: "Failed to assign checklists" }, { status: 500 });
      }

      // Note: Actual SMS sending would happen via a separate trigger or cron job
      // For now, workers will get the checklist when they next text "CHECKLIST"
      
      return NextResponse.json({ success: true, assigned: workerPhones.length });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Checklist PATCH error:", error);
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

// Delete template
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const templateId = searchParams.get("templateId");

  if (!templateId) {
    return NextResponse.json({ error: "Template ID required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("checklist_templates")
    .delete()
    .eq("id", templateId);

  if (error) {
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
