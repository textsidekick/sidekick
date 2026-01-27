import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

async function getValidAccessToken(companyId: string): Promise<{ token: string; realmId: string } | null> {
  const { data: connection } = await supabase
    .from("quickbooks_connections")
    .select("*")
    .eq("company_id", companyId)
    .single();

  if (!connection) return null;
  return { token: connection.access_token, realmId: connection.realm_id };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId") || "demo";
  const action = searchParams.get("action") || "status";

  if (action === "status") {
    const { data: connection } = await supabase
      .from("quickbooks_connections")
      .select("quickbooks_company_name, connected_at")
      .eq("company_id", companyId)
      .single();

    return NextResponse.json({
      connected: !!connection,
      companyName: connection?.quickbooks_company_name,
      connectedAt: connection?.connected_at,
    });
  }

  const auth = await getValidAccessToken(companyId);
  if (!auth) {
    return NextResponse.json({ error: "Not connected to QuickBooks" }, { status: 401 });
  }

  if (action === "employees") {
    try {
      const response = await fetch(
        `https://sandbox-quickbooks.api.intuit.com/v3/company/${auth.realmId}/query?query=SELECT * FROM Employee`,
        {
          headers: { 
            Authorization: `Bearer ${auth.token}`,
            Accept: "application/json",
          },
        }
      );
      const data = await response.json();
      const employees = data.QueryResponse?.Employee || [];
      return NextResponse.json({ 
        employees: employees.map((emp: any) => ({
          id: emp.Id,
          name: `${emp.GivenName || ""} ${emp.FamilyName || ""}`.trim(),
          email: emp.PrimaryEmailAddr?.Address,
          phone: emp.PrimaryPhone?.FreeFormNumber || emp.Mobile?.FreeFormNumber,
          active: emp.Active,
        }))
      });
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const { companyId, employees } = await req.json();

    if (!companyId || !employees) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let imported = 0;
    for (const emp of employees) {
      if (!emp.phone) continue;
      
      const phone = emp.phone.replace(/\D/g, "");
      if (phone.length < 10) continue;

      const { data: existing } = await supabase
        .from("workers")
        .select("id")
        .eq("phone", phone)
        .eq("company_id", companyId)
        .single();

      if (!existing) {
        await supabase.from("workers").insert({
          company_id: companyId,
          phone: phone,
          name: emp.name,
          role: "Employee",
          created_at: new Date().toISOString(),
        });
        imported++;
      }
    }

    return NextResponse.json({ ok: true, imported });
  } catch (error: any) {
    console.error("QuickBooks sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  const { error } = await supabase
    .from("quickbooks_connections")
    .delete()
    .eq("company_id", companyId);

  if (error) {
    console.error("Failed to disconnect QuickBooks:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
