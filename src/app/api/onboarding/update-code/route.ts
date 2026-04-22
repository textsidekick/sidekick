import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { companyId, newCode } = await request.json();

    if (!companyId || !newCode) {
      return NextResponse.json(
        { error: "companyId and newCode are required" },
        { status: 400 }
      );
    }

    const sanitized = newCode.toUpperCase().replace(/[^A-Z0-9]/g, "");

    // Check if code is available
    const { data: existing } = await supabase
      .from("companies")
      .select("id")
      .eq("access_code", sanitized)
      .neq("id", companyId)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Code is already taken" },
        { status: 409 }
      );
    }

    // Update the code
    const { error } = await supabase
      .from("companies")
      .update({ access_code: sanitized })
      .eq("id", companyId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      accessCode: sanitized,
      joinCommand: "JOIN " + sanitized,
    });
  } catch (error) {
    console.error("[Update Code] Error:", error);
    return NextResponse.json(
      { error: "Failed to update code" },
      { status: 500 }
    );
  }
}
