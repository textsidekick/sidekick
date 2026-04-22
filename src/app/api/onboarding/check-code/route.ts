import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

// Generate smart suggestions when a custom code is taken
function generateCodeSuggestions(baseCode: string): string[] {
  const suggestions: string[] = [];
  for (const suffix of ["1", "2", "3", "123", "01"]) {
    suggestions.push(baseCode + suffix);
  }
  suggestions.push(baseCode + new Date().getFullYear().toString().slice(-2));
  return suggestions;
}

export async function POST(request: NextRequest) {
  try {
    const { code, companyId } = await request.json();

    if (!code) {
      return NextResponse.json({ error: "code is required" }, { status: 400 });
    }

    const sanitized = code.toUpperCase().replace(/[^A-Z0-9]/g, "");

    if (sanitized.length < 2 || sanitized.length > 12) {
      return NextResponse.json({
        available: false,
        error: "Code must be 2-12 characters (letters and numbers only)",
      });
    }

    // Check if code is taken (excluding current company)
    let query = supabase
      .from("companies")
      .select("id")
      .eq("access_code", sanitized);

    if (companyId) {
      query = query.neq("id", companyId);
    }

    const { data: existing } = await query.single();

    if (existing) {
      // Code is taken — generate suggestions
      const suggestions = generateCodeSuggestions(sanitized);
      const availableSuggestions: string[] = [];
      for (const suggestion of suggestions) {
        let subQuery = supabase
          .from("companies")
          .select("id")
          .eq("access_code", suggestion);
        if (companyId) subQuery = subQuery.neq("id", companyId);
        const { data: sugExists } = await subQuery.single();
        if (!sugExists) availableSuggestions.push(suggestion);
      }
      return NextResponse.json({
        available: false,
        code: sanitized,
        suggestions: availableSuggestions.slice(0, 4),
      });
    }

    return NextResponse.json({ available: true, code: sanitized });
  } catch (error) {
    console.error("[Check Code] Error:", error);
    return NextResponse.json(
      { error: "Failed to check code" },
      { status: 500 }
    );
  }
}
