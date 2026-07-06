import { supabase } from "@/lib/supabase";

export type LocationSeed = {
  name: string;
  city?: string | null;
  state?: string | null;
  address?: string | null;
  isPrimary?: boolean;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "location";
}

export function locationIdFor(companyId: string, name: string) {
  return `${companyId}-${slugify(name)}`;
}

export function parseAddressParts(address?: string | null) {
  if (!address) return { city: null, state: null };
  const parts = address.split(",").map((part) => part.trim()).filter(Boolean);
  return {
    city: parts[0] || null,
    state: parts[1] || null,
  };
}

export async function createCompanyLocations(companyId: string, seeds: LocationSeed[]) {
  const cleaned = seeds
    .map((seed, index) => {
      const name = seed.name?.trim();
      if (!name) return null;
      return {
        id: locationIdFor(companyId, name),
        company_id: companyId,
        name,
        city: seed.city?.trim() || null,
        state: seed.state?.trim() || null,
        address: seed.address?.trim() || null,
        is_primary: Boolean(seed.isPrimary ?? index === 0),
      };
    })
    .filter(Boolean) as Array<Record<string, unknown>>;

  if (cleaned.length === 0) return [];

  const { data, error } = await supabase
    .from("locations")
    .upsert(cleaned as any[], { onConflict: "id" })
    .select("id,name,city,state,address,is_primary");

  if (error) {
    console.error("[locations] createCompanyLocations failed:", error);
    return [];
  }

  return data || [];
}

export async function findLocationIdByName(companyId: string, rawName?: string | null) {
  const name = rawName?.trim();
  if (!name) return null;

  const exact = await supabase
    .from("locations")
    .select("id,name")
    .eq("company_id", companyId)
    .ilike("name", name)
    .limit(1)
    .maybeSingle();

  if (exact.data?.id) return exact.data.id;

  const fuzzy = await supabase
    .from("locations")
    .select("id,name")
    .eq("company_id", companyId)
    .ilike("name", `%${name}%`)
    .limit(1)
    .maybeSingle();

  return fuzzy.data?.id || null;
}
