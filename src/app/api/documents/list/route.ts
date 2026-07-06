import { NextRequest, NextResponse } from "next/server";
import { getDocumentsByCompany } from "@/lib/documentClassifier";
import { getCompanyId } from "@/lib/dashboard-auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const companyId = await getCompanyId(req) || "demo";

    const documents = getDocumentsByCompany(companyId);

    const grouped = documents.reduce((acc: any, doc) => {
      if (!acc[doc.type]) acc[doc.type] = [];
      acc[doc.type].push(doc);
      return acc;
    }, {});

    return NextResponse.json({
      ok: true,
      documents,
      grouped,
      total: documents.length,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Failed to list documents", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
