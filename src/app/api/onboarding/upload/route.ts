import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const companyId = formData.get("companyId") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

    // Read file content
    const text = await file.text();

    // Save to documents table
    const { data, error } = await supabase
      .from("documents")
      .insert({
        company_id: companyId,
        name: file.name,
        content: text,
      })
      .select()
      .single();

    if (error) {
      console.error("[Upload] Supabase error:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      documentId: data?.id,
      name: file.name,
    });
  } catch (error) {
    console.error("[Upload] Error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
