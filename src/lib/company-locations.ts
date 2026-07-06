export interface CompanyLocation {
  id: string;
  name: string;
  city?: string;
  state?: string;
  address?: string;
  isPrimary?: boolean;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "location";
}

export function normalizeCompanyLocation(input: unknown, companyId: string, index = 0): CompanyLocation | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const name = typeof raw.name === "string" ? raw.name.trim() : "";
  const city = typeof raw.city === "string" ? raw.city.trim() : "";
  const state = typeof raw.state === "string" ? raw.state.trim() : "";
  const address = typeof raw.address === "string" ? raw.address.trim() : "";
  const fallbackName = name || city || address || `Location ${index + 1}`;
  const id = typeof raw.id === "string" && raw.id.trim()
    ? raw.id.trim()
    : `${companyId}-${slugify(fallbackName)}`;

  return {
    id,
    name: fallbackName,
    city: city || undefined,
    state: state || undefined,
    address: address || undefined,
    isPrimary: Boolean(raw.isPrimary),
  };
}

export function extractCompanyLocations(company: Record<string, unknown> | null | undefined): CompanyLocation[] {
  if (!company) return [];

  const directLocations = Array.isArray(company.locations) ? company.locations : [];
  const metadata = company.metadata && typeof company.metadata === "object"
    ? (company.metadata as Record<string, unknown>)
    : null;
  const metadataLocations = metadata && Array.isArray(metadata.locations) ? metadata.locations : [];

  const source = directLocations.length > 0 ? directLocations : metadataLocations;
  return source
    .map((entry, index) => normalizeCompanyLocation(entry, String(company.id || "company"), index))
    .filter((entry): entry is CompanyLocation => Boolean(entry));
}

export function chooseDefaultLocationId(locations: CompanyLocation[]): string {
  const primary = locations.find((location) => location.isPrimary);
  return primary?.id || locations[0]?.id || "all";
}
