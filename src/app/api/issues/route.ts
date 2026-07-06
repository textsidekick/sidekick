import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyPhonesForLocation } from "@/lib/location-scope";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const companyId = searchParams.get("companyId");
  const locationId = searchParams.get("locationId");
  const status = searchParams.get("status"); // "open", "resolved", or null for all

  if (!companyId) {
    return NextResponse.json({ error: "Company ID required" }, { status: 400 });
  }

  try {
    let query = supabase
      .from("issues")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (locationId && locationId !== "all") {
      const phones = await getCompanyPhonesForLocation(companyId, locationId);
      if (!phones?.length) {
        return NextResponse.json({
          issues: [],
          stats: { total: 0, open: 0, resolved: 0, highPriority: 0, mediumPriority: 0, lowPriority: 0, byEquipment: {} },
        });
      }
      query = query.in("worker_phone", phones);
    }

    if (status) {
      query = query.eq("status", status);
    }

    const { data: issues, error } = await query;

    if (error) {
      console.error("Issues fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 });
    }

    // Calculate stats
    const allIssues = issues || [];
    const openIssues = allIssues.filter(i => i.status === "open");
    const resolvedIssues = allIssues.filter(i => i.status === "resolved");
    
    const highPriority = openIssues.filter(i => i.severity === "high").length;
    const mediumPriority = openIssues.filter(i => i.severity === "medium").length;
    const lowPriority = openIssues.filter(i => i.severity === "low").length;

    // Group by equipment
    const byEquipment: Record<string, number> = {};
    allIssues.forEach(issue => {
      const equip = issue.equipment || "Unspecified";
      byEquipment[equip] = (byEquipment[equip] || 0) + 1;
    });

    return NextResponse.json({
      issues: allIssues,
      stats: {
        total: allIssues.length,
        open: openIssues.length,
        resolved: resolvedIssues.length,
        highPriority,
        mediumPriority,
        lowPriority,
        byEquipment,
      }
    });

  } catch (error) {
    console.error("Issues error:", error);
    return NextResponse.json({ error: "Failed to fetch issues" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { issueId, status, notes, resolved_by } = await request.json();

    if (!issueId) {
      return NextResponse.json({ error: "Issue ID required" }, { status: 400 });
    }

    const updates: any = {};
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (resolved_by) updates.resolved_by = resolved_by;
    if (status === "resolved") updates.resolved_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("issues")
      .update(updates)
      .eq("id", issueId)
      .select()
      .single();

    if (error) {
      console.error("Issue update error:", error);
      return NextResponse.json({ error: "Failed to update issue" }, { status: 500 });
    }

    return NextResponse.json({ success: true, issue: data });

  } catch (error) {
    console.error("Issue update error:", error);
    return NextResponse.json({ error: "Failed to update issue" }, { status: 500 });
  }
}
