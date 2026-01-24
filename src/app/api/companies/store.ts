import { supabase } from "@/lib/supabase";

export interface Location {
  id: string;
  name: string;
  city: string;
  state: string;
}

export interface Company {
  id: string;
  name: string;
  locations: Location[];
  createdAt?: string;
}

export interface Worker {
  phone: string;
  companyId: string;
  locationId: string;
  registeredAt: string;
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

  return (data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    locations: c.locations || [],
    createdAt: c.created_at,
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
    companyId: w.company_id,
    locationId: w.location_id,
    registeredAt: w.created_at,
  }));
}
