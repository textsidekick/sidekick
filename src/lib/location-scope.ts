import { supabase } from "@/lib/supabase";

export async function getCompanyPhonesForLocation(companyId: string, locationId?: string | null) {
  if (!locationId || locationId === "all") return null;

  const { data, error } = await supabase
    .from("workers")
    .select("phone")
    .eq("company_id", companyId)
    .eq("location_id", locationId);

  if (error) {
    console.error("[location-scope] worker phone lookup failed:", error);
    return [];
  }

  return (data || []).map((row: any) => row.phone).filter(Boolean);
}
