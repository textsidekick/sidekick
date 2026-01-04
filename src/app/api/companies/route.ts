import { NextRequest, NextResponse } from "next/server";
import { getCompanies, saveCompanies, registerWorker, getWorkers } from "./store";

export async function GET() {
  const companies = await getCompanies();
  const workers = await getWorkers();
  return NextResponse.json({ companies, workers });
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
