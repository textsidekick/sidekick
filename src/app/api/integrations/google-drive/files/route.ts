import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const companyId = req.nextUrl.searchParams.get("companyId");
  
  if (!companyId) {
    return NextResponse.json({ error: "Company ID required" }, { status: 400 });
  }

  const { data: connection } = await supabase
    .from("google_drive_connections")
    .select("*")
    .eq("company_id", companyId)
    .single();

  if (!connection?.access_token) {
    return NextResponse.json({ error: "Not connected to Google Drive" }, { status: 401 });
  }

  try {
    const response = await fetch(
      "https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,mimeType,modifiedTime)",
      {
        headers: {
          Authorization: `Bearer ${connection.access_token}`,
        },
      }
    );

    if (!response.ok) {
      const refreshResponse = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: connection.refresh_token,
          grant_type: "refresh_token",
        }),
      });

      if (refreshResponse.ok) {
        const tokens = await refreshResponse.json();
        
        await supabase
          .from("google_drive_connections")
          .update({ access_token: tokens.access_token })
          .eq("company_id", companyId);

        const retryResponse = await fetch(
          "https://www.googleapis.com/drive/v3/files?pageSize=20&fields=files(id,name,mimeType,modifiedTime)",
          {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
            },
          }
        );

        const data = await retryResponse.json();
        return NextResponse.json({ files: data.files || [] });
      }

      return NextResponse.json({ error: "Failed to access Google Drive" }, { status: 401 });
    }

    const data = await response.json();
    return NextResponse.json({ files: data.files || [] });
  } catch (error) {
    console.error("Google Drive API error:", error);
    return NextResponse.json({ error: "Failed to fetch files" }, { status: 500 });
  }
}
