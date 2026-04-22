import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateUsername, generatePassword, hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { companyId } = await request.json();

    if (!companyId) {
      return NextResponse.json(
        { error: "companyId is required" },
        { status: 400 }
      );
    }

    const username = generateUsername();
    const password = generatePassword();
    const passwordHash = hashPassword(password);

    // Store credentials in Supabase
    const { error } = await supabase.from("manager_users").insert({
      company_id: companyId,
      username,
      password_hash: passwordHash,
    });

    if (error) {
      console.error("[Generate Credentials] DB error:", error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      username,
      password,
      message: "Manager credentials generated. Save these securely!",
    });
  } catch (error) {
    console.error("[Generate Credentials] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate credentials" },
      { status: 500 }
    );
  }
}
