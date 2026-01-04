import { put, list, del } from "@vercel/blob";

export interface Company {
  id: string;
  name: string;
  phoneNumbers: string[];
  createdAt: string;
}

const COMPANIES_KEY = "companies.json";

export async function getCompanies(): Promise<Company[]> {
  try {
    const { blobs } = await list({ prefix: COMPANIES_KEY });
    if (blobs.length === 0) return getDefaultCompanies();
    
    const response = await fetch(blobs[0].url);
    return await response.json();
  } catch (e) {
    console.error("Companies fetch error:", e);
    return getDefaultCompanies();
  }
}

function getDefaultCompanies(): Company[] {
  return [
    { id: "eds", name: "EDS Manufacturing", phoneNumbers: [], createdAt: new Date().toISOString() },
    { id: "trinethra", name: "Trinethra Supermarket", phoneNumbers: [], createdAt: new Date().toISOString() },
  ];
}

export async function saveCompanies(companies: Company[]): Promise<void> {
  try {
    const { blobs } = await list({ prefix: COMPANIES_KEY });
    for (const blob of blobs) await del(blob.url);
  } catch (e) {}
  
  await put(COMPANIES_KEY, JSON.stringify(companies), { access: "public", addRandomSuffix: false });
}

export async function getCompanyByPhone(phone: string): Promise<Company | null> {
  const companies = await getCompanies();
  const normalized = phone.replace(/\D/g, "").slice(-10);
  
  for (const company of companies) {
    for (const p of company.phoneNumbers) {
      if (p.replace(/\D/g, "").slice(-10) === normalized) {
        return company;
      }
    }
  }
  return null;
}

export async function assignPhoneToCompany(phone: string, companyId: string): Promise<void> {
  const companies = await getCompanies();
  
  for (const company of companies) {
    company.phoneNumbers = company.phoneNumbers.filter(p => 
      p.replace(/\D/g, "").slice(-10) !== phone.replace(/\D/g, "").slice(-10)
    );
  }
  
  const company = companies.find(c => c.id === companyId);
  if (company) {
    company.phoneNumbers.push(phone);
  }
  
  await saveCompanies(companies);
}
