import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createCompanyLocations, parseAddressParts } from "@/lib/location-utils";

function generateJoinCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(req: NextRequest) {
  try {
    const { name, industry, address, locations } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "name required" }, { status: 400 });

    const joinCode = generateJoinCode();

    // Try to find existing company by name
    const { data: existing } = await supabase
      .from("companies")
      .select("id, access_code")
      .ilike("name", name.trim())
      .limit(1)
      .single();

    if (existing) {
      return NextResponse.json({ companyId: existing.id, joinCode: (existing as any).access_code || joinCode });
    }

    const { data: company, error } = await supabase
      .from("companies")
      .insert({
        name: name.trim(),
        industry: industry || null,
        address: address || null,
        access_code: joinCode,
      } as any)
      .select()
      .single();

    if (error) throw error;

    // Create default manager account
    await supabase.from("manager_accounts").insert({
      company_id: company.id,
      plan: "trial",
      trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      questions_used: 0,
      questions_limit: 100,
    } as any);

    const locationSeeds = Array.isArray(locations) && locations.length > 0
      ? locations
      : [{
          name: address?.trim() ? `${name.trim()} - Main location` : `${name.trim()} - Main site`,
          address: address || null,
          ...parseAddressParts(address || null),
          isPrimary: true,
        }];

    await createCompanyLocations(company.id, locationSeeds);

    return NextResponse.json({ companyId: company.id, joinCode }, { status: 201 });
  } catch (e: any) {
    console.error("[Onboarding] Company error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
