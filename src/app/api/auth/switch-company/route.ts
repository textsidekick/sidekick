import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("sidekick_session")?.value;
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    const { companyId } = await request.json();
    if (!companyId) return NextResponse.json({ error: "companyId required" }, { status: 400 });

    // Verify the company exists
    const { data: company } = await supabase
      .from("companies")
      .select("id, name")
      .eq("id", companyId)
      .single();

    if (!company) return NextResponse.json({ error: "Company not found" }, { status: 404 });

    // Update the session to point to the new company
    const { error } = await supabase
      .from("manager_sessions")
      .update({ company_id: companyId })
      .eq("token", token);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, companyId, companyName: company.name });
  } catch (error) {
    console.error("[switch-company] Error:", error);
    return NextResponse.json({ error: "Failed to switch company" }, { status: 500 });
  }
}
