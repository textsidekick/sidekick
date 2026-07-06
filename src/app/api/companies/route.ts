import { NextRequest, NextResponse } from "next/server";
import { getCompanies, saveCompanies, registerWorker, getWorkers } from "./store";
import { getCompanyId } from "@/lib/dashboard-auth";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const companyId = await getCompanyId(request);

  // If authenticated, scope to their company; otherwise return all (login page needs this)
  if (companyId) {
    const companies = await getCompanies();
    const scopedCompanies = companies.filter(c => c.id === companyId);
    const { data: workers } = await supabase
      .from("workers")
      .select("phone, company_id, location_id, created_at, name")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });
    return NextResponse.json({
      companies: scopedCompanies,
      workers: (workers || []).map((w: any) => ({ phone: w.phone, company_id: w.company_id, location_id: w.location_id, registered_at: w.created_at, name: w.name })),
    });
  }

  // Unauthenticated — return companies list without sensitive data, no workers
  const companies = await getCompanies();
  return NextResponse.json({
    companies: companies.map(c => ({ id: c.id, name: c.name, locations: c.locations })),
    workers: [],
  });
}

export async function POST(request: NextRequest) {
  const { action, phone, companyId, locationId, company } = await request.json();
  
  if (action === "assignPhone" && phone && companyId) {
    await registerWorker(phone, companyId, locationId || companyId);
    return NextResponse.json({ success: true });
  }
  
  if (action === "addCompany" && company) {
    const companies = await getCompanies();
    companies.push({
      id: company.id,
      name: company.name,
      locations: company.locations || [],
      createdAt: new Date().toISOString(),
    });
    await saveCompanies(companies);
    return NextResponse.json({ success: true });
  }
  
  if (action === "addLocation" && companyId) {
    const companies = await getCompanies();
    const comp = companies.find(c => c.id === companyId);
    if (comp && company?.location) {
      comp.locations.push(company.location);
      await saveCompanies(companies);
    }
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
