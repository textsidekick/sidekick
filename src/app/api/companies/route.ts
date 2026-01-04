import { NextRequest, NextResponse } from "next/server";
import { getCompanies, saveCompanies, assignPhoneToCompany } from "./store";

export async function GET() {
  const companies = await getCompanies();
  return NextResponse.json({ companies });
}

export async function POST(request: NextRequest) {
  const { action, phone, companyId, company } = await request.json();
  
  if (action === "assignPhone") {
    await assignPhoneToCompany(phone, companyId);
    return NextResponse.json({ success: true });
  }
  
  if (action === "addCompany" && company) {
    const companies = await getCompanies();
    companies.push({
      id: company.id,
      name: company.name,
      phoneNumbers: [],
      createdAt: new Date().toISOString(),
    });
    await saveCompanies(companies);
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
