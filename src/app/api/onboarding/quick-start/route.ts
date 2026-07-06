export const maxDuration = 30;

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { v4 as uuid } from "uuid";
import { createCompanyLocations, locationIdFor } from "@/lib/location-utils";

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone, industry } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Company name is required" }, { status: 400 });
    }

    const companyId = uuid();
    const joinCode = generateJoinCode();
    const primaryLocationName = `${name.trim()} - Main site`;

    // Create company
    const { error: compErr } = await supabase.from("companies").insert({
      id: companyId,
      name: name.trim(),
      industry: industry || null,
      access_code: joinCode,
    });

    if (compErr) {
      console.error("[quick-start] company insert:", compErr);
      // Might be a column issue, try minimal insert
      const { error: compErr2 } = await supabase.from("companies").insert({
        id: companyId,
        name: name.trim(),
      });
      if (compErr2) throw compErr2;
    }

    await createCompanyLocations(companyId, [
      { name: primaryLocationName, isPrimary: true },
    ]);

    // Create manager worker if phone provided
    if (phone) {
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
      const normalizedPhone = cleanPhone.startsWith("+") ? cleanPhone : "+1" + cleanPhone;

      await supabase.from("workers").insert({
        company_id: companyId,
        location_id: locationIdFor(companyId, primaryLocationName),
        name: "Manager",
        phone: normalizedPhone,
        role: "manager",
        verified: true,
      });
    }

    return NextResponse.json({
      companyId,
      joinCode,
      smsNumber: process.env.TWILIO_PHONE_NUMBER || "+1 888 707 4659",
    });
  } catch (e: any) {
    console.error("[quick-start]", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
