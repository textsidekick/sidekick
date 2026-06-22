import { getCompanyId } from "@/lib/dashboard-auth";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { buildEscalationPackage, executeVendorEscalation } from "@/lib/vendor-escalation";

// GET: Preview escalation package for a work order
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("sidekick_session")?.value;
    if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { data: session } = await supabase
      .from("manager_sessions")
      .select("company_id")
      .eq("token", token)
      .single();
    if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const workOrderId = request.nextUrl.searchParams.get("workOrderId");
    if (!workOrderId) return NextResponse.json({ error: "workOrderId required" }, { status: 400 });

    const pkg = await buildEscalationPackage(workOrderId);
    return NextResponse.json(pkg);
  } catch (error) {
    console.error("[vendor-escalation] Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}

// POST: Execute vendor escalation
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("sidekick_session")?.value;
    if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { data: session } = await supabase
      .from("manager_sessions")
      .select("company_id")
      .eq("token", token)
      .single();
    if (!session) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

    const { workOrderId, vendorPhone } = await request.json();
    if (!workOrderId) return NextResponse.json({ error: "workOrderId required" }, { status: 400 });

    const result = await executeVendorEscalation(workOrderId, vendorPhone);
    return NextResponse.json(result);
  } catch (error) {
    console.error("[vendor-escalation] Error:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
