import { supabase } from "@/lib/supabase";
import type { CompanyLocation } from "@/lib/company-locations";

export type Location = CompanyLocation;

export interface Company {
  id: string;
  name: string;
  locations: Location[];
  createdAt?: string;
}

export interface Worker {
  phone: string;
  company_id: string;
  location_id: string;
  registered_at: string;
  name?: string;
}

export async function getCompanies(): Promise<Company[]> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching companies:", error);
    return [];
  }

  const companyIds = (data || []).map((company: any) => company.id).filter(Boolean);
  const { data: locationRows } = companyIds.length > 0
    ? await supabase
        .from("locations")
        .select("id,company_id,name,city,state,address,is_primary")
        .in("company_id", companyIds)
        .order("is_primary", { ascending: false })
        .order("name", { ascending: true })
    : { data: [] as any[] };

  const locationsByCompany = new Map<string, CompanyLocation[]>();
  for (const row of locationRows || []) {
    const list = locationsByCompany.get((row as any).company_id) || [];
    list.push({
      id: (row as any).id,
      name: (row as any).name,
      city: (row as any).city || undefined,
      state: (row as any).state || undefined,
      address: (row as any).address || undefined,
      isPrimary: Boolean((row as any).is_primary),
    });
    locationsByCompany.set((row as any).company_id, list);
  }

  return (data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    locations: locationsByCompany.get(c.id) || [],
    createdAt: c.created_at,
    access_code: c.access_code,
    manager_phone: c.manager_phone,
    manager_name: c.manager_name,
  }));
}

export async function saveCompanies(companies: Company[]): Promise<void> {
  for (const company of companies) {
    const { error } = await supabase
      .from("companies")
      .upsert({
        id: company.id,
        name: company.name,
        created_at: company.createdAt || new Date().toISOString(),
      }, { onConflict: "id" });

    if (error) {
      console.error("Error saving company:", error);
    }
  }
}

export async function getCompany(id: string): Promise<Company | null> {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching company:", error);
    return null;
  }

  return data;
}

export async function registerWorker(phone: string, companyId: string, locationId: string): Promise<void> {
  const { error } = await supabase
    .from("workers")
    .upsert({
      phone,
      company_id: companyId,
      location_id: locationId,
      verified: false,
    }, { onConflict: "phone" });

  if (error) {
    console.error("Error registering worker:", error);
  }
}

export async function getWorkers(): Promise<Worker[]> {
  const { data, error } = await supabase
    .from("workers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching workers:", error);
    return [];
  }

  return (data || []).map((w: any) => ({
    phone: w.phone,
    company_id: w.company_id,
    location_id: w.location_id,
    registered_at: w.created_at,
    name: w.name,
  }));
}
