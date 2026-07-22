export type CompanyVertical = "hotel" | "industrial" | "generic";

function normalize(value: string | null | undefined) {
  return String(value || "").toLowerCase();
}

export function detectCompanyVertical(company?: { name?: string | null; industry?: string | null } | null): CompanyVertical {
  const haystack = `${normalize(company?.name)} ${normalize(company?.industry)}`;

  if (/(hotel|motel|hospitality|inn|lodg(e|ing)|guest room|housekeeping|front desk|resort)/.test(haystack)) {
    return "hotel";
  }

  if (/(manufactur|industrial|plant|warehouse|facility|fabricat|maintenance|shop|automotive|auto body)/.test(haystack)) {
    return "industrial";
  }

  return "generic";
}

export function buildCompanyAssistantDescriptor(company?: { name?: string | null; industry?: string | null } | null) {
  const name = company?.name || "this company";
  const vertical = detectCompanyVertical(company);

  if (vertical === "hotel") {
    return {
      vertical,
      descriptor: `${name} (hotel or motel operations)`,
      operatingContext:
        "You support hotel operations across guests, front desk, housekeeping, and maintenance. Common requests include towels, late checkout, breakfast, parking, room cleaning, broken showers, TVs, HVAC, key cards, spills, and restocking.",
    };
  }

  if (vertical === "industrial") {
    return {
      vertical,
      descriptor: `${name}${company?.industry ? ` (${company.industry})` : " (industrial operations)"}`,
      operatingContext:
        "You support frontline industrial operations. Common requests include equipment problems, maintenance issues, SOP questions, parts, safety concerns, training, and work order updates.",
    };
  }

  return {
    vertical,
    descriptor: `${name}${company?.industry ? ` (${company.industry})` : ""}`,
    operatingContext:
      "You support frontline operations. Answer practical questions, help coordinate work, and stay grounded in the company's documented knowledge.",
  };
}
