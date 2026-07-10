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

    // Determine if this is a text file or binary file
    const textExtensions = [".txt", ".csv", ".md", ".json", ".xml", ".html", ".htm"];
    const fileName = file.name.toLowerCase();
    const isTextFile = textExtensions.some((ext) => fileName.endsWith(ext));

    let content: string;
    if (isTextFile) {
      content = await file.text();
    } else {
      // Binary file (PDF, DOC, JPG, PNG, etc.) — store metadata placeholder
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const sizeStr = file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(0)}KB` : `${sizeMB}MB`;
      content = `[Binary file: ${file.name}, size: ${sizeStr}, type: ${file.type || "unknown"}]`;
    }

    // Save to documents table
    const { data, error } = await supabase
      .from("documents")
      .insert({
        company_id: companyId,
        name: file.name,
        content,
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
