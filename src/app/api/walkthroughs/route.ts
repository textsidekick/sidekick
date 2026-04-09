import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("companyId");
  
  if (!companyId) {
    return NextResponse.json({ error: "Company ID required" }, { status: 400 });
  }

  // Get walkthrough documents
  const { data: docs, error: docsError } = await supabase
    .from("documents")
    .select("*")
    .eq("company_id", companyId)
    .like("name", "Walkthrough%")
    .order("created_at", { ascending: false });

  if (docsError) {
    return NextResponse.json({ error: docsError.message }, { status: 500 });
  }

  // For each walkthrough, get its chunks
  const walkthroughs = await Promise.all(
    (docs || []).map(async (doc) => {
      const { data: chunks } = await supabase
        .from("document_chunks")
        .select("content, metadata")
        .eq("document_id", doc.id);

      return {
        id: doc.id,
        name: doc.name,
        createdAt: doc.created_at,
        locations: doc.metadata?.locations || chunks?.length || 0,
        chunks: chunks || [],
      };
    })
  );

  return NextResponse.json({ walkthroughs });
}
