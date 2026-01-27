import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

async function getValidAccessToken(companyId: string): Promise<{ token: string; gustoCompanyId: string } | null> {
  const { data: connection } = await supabase
    .from("gusto_connections")
    .select("*")
    .eq("company_id", companyId)
    .single();

  if (!connection) return null;
  return { token: connection.access_token, gustoCompanyId: connection.gusto_company_id };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId") || "demo";
  const action = searchParams.get("action") || "status";

  if (action === "status") {
    const { data: connection } = await supabase
      .from("gusto_connections")
      .select("gusto_company_name, connected_at")
      .eq("company_id", companyId)
      .single();

    return NextResponse.json({
      connected: !!connection,
      companyName: connection?.gusto_company_name,
      connectedAt: connection?.connected_at,
    });
  }

  const auth = await getValidAccessToken(companyId);
  if (!auth) {
    return NextResponse.json({ error: "Not connected to Gusto" }, { status: 401 });
  }

  if (action === "employees") {
    try {
      const response = await fetch(`https://api.gusto-demo.com/v1/companies/${auth.gustoCompanyId}/employees`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const employees = await response.json();
      
      return NextResponse.json({ 
        employees: Array.isArray(employees) ? employees.map((emp: any) => ({
          id: emp.id,
          firstName: emp.first_name,
          lastName: emp.last_name,
          email: emp.email,
          phone: emp.phone,
          department: emp.department,
          jobTitle: emp.job_title,
          startDate: emp.start_date,
        })) : []
      });
    } catch (error) {
      console.error("Failed to fetch Gusto employees:", error);
      return NextResponse.json({ error: "Failed to fetch employees" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const { companyId, employees } = await req.json();

    if (!companyId || !employees) {
      return NextResponse.json({ error: "Missing companyId or employees" }, { status: 400 });
    }

    // Sync employees to Sidekick's workers table
    const { data: existingWorkers } = await supabase
      .from("workers")
      .select("phone")
      .eq("company_id", companyId);

    const existingPhones = new Set(existingWorkers?.map(w => w.phone) || []);
    
    let imported = 0;
    for (const emp of employees) {
      if (emp.phone && !existingPhones.has(emp.phone)) {
        const { error } = await supabase
          .from("workers")
          .insert({
            company_id: companyId,
            name: `${emp.firstName} ${emp.lastName}`,
            phone: emp.phone,
            role: emp.jobTitle || "Employee",
            department: emp.department || "General",
            status: "active",
            created_at: new Date().toISOString(),
          });
        
        if (!error) imported++;
      }
    }

    return NextResponse.json({ ok: true, imported });
  } catch (error: any) {
    console.error("Gusto sync error:", error);
    return NextResponse.json({ error: "Sync failed: " + error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const companyId = searchParams.get("companyId");

  if (!companyId) {
    return NextResponse.json({ error: "Missing companyId" }, { status: 400 });
  }

  const { error } = await supabase
    .from("gusto_connections")
    .delete()
    .eq("company_id", companyId);

  if (error) {
    console.error("Failed to disconnect Gusto:", error);
    return NextResponse.json({ error: "Failed to disconnect" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
