import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";
import { normalizePhoneNumber } from "@/lib/phone";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Generate a random 6-character access code
function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Generate smart suggestions when a custom code is taken
function generateCodeSuggestions(baseCode: string): string[] {
  const suggestions: string[] = [];
  // Add numeric suffixes
  for (const suffix of ["1", "2", "3", "123", "01"]) {
    suggestions.push(baseCode + suffix);
  }
  // Add year suffix
  suggestions.push(baseCode + new Date().getFullYear().toString().slice(-2));
  return suggestions;
}

export async function POST(request: NextRequest) {
  console.log("[Onboarding Complete] === API HIT ===");

  try {
    const { messages, customCode } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "messages array is required" },
        { status: 400 }
      );
    }

    // Extract structured data from conversation
    const conversationText = messages
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join("\n");

    console.log("[Onboarding Complete] Extracting data from conversation...");

    const extractionPrompt = `Extract the following information from this onboarding conversation. Return ONLY a valid JSON object with these fields (use null for missing values):

{
  "companyName": "string",
  "industry": "string",
  "numLocations": "number or null",
  "numWorkers": "number or null",
  "painPoints": ["string array of main challenges"],
  "communicationMethods": ["string array of current methods"]
}

Conversation:
${conversationText}

Return ONLY the JSON object, no markdown or extra text.`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: extractionPrompt,
        },
      ],
    });

    const responseText =
      response.content[0].type === "text" ? response.content[0].text : "{}";

    // Parse extracted data
    let extractedData;
    try {
      extractedData = JSON.parse(responseText);
    } catch (e) {
      console.error("[Onboarding Complete] JSON parse error:", responseText);
      extractedData = {
        companyName: null,
        industry: null,
        numLocations: null,
        numWorkers: null,
        painPoints: [],
        communicationMethods: [],
      };
    }

    console.log("[Onboarding Complete] Extracted data:", extractedData);

    if (!extractedData.companyName) {
      return NextResponse.json(
        { error: "Could not extract company name from conversation" },
        { status: 400 }
      );
    }

    // Generate company ID and access code
    const companyId = extractedData.companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    let accessCode: string;
    let codeSuggestions: string[] | undefined;

    if (customCode) {
      // User wants a custom code — check availability
      const sanitized = customCode.toUpperCase().replace(/[^A-Z0-9]/g, "");
      const { data: existing } = await supabase
        .from("companies")
        .select("id")
        .eq("access_code", sanitized)
        .single();

      if (existing) {
        // Code is taken — generate suggestions and return them
        const suggestions = generateCodeSuggestions(sanitized);
        const availableSuggestions: string[] = [];
        for (const suggestion of suggestions) {
          const { data: sugExists } = await supabase
            .from("companies")
            .select("id")
            .eq("access_code", suggestion)
            .single();
          if (!sugExists) availableSuggestions.push(suggestion);
        }
        return NextResponse.json({
          success: false,
          codeTaken: true,
          requestedCode: sanitized,
          suggestions: availableSuggestions.slice(0, 4),
        });
      }
      accessCode = sanitized;
    } else {
      // Auto-generate code
      accessCode = generateAccessCode();
      let attempts = 0;
      while (attempts < 10) {
        const { data: existing } = await supabase
          .from("companies")
          .select("id")
          .eq("access_code", accessCode)
          .single();

        if (!existing) break;
        accessCode = generateAccessCode();
        attempts++;
      }
    }

    console.log(
      "[Onboarding Complete] Creating company:",
      companyId,
      "with access code:",
      accessCode
    );

    // Save to Supabase
    const { error: companyError } = await supabase
      .from("companies")
      .upsert(
        {
          id: companyId,
          name: extractedData.companyName,
          industry: extractedData.industry || null,
          num_locations: extractedData.numLocations || null,
          num_workers: extractedData.numWorkers || null,
          pain_points: extractedData.painPoints || [],
          communication_methods: extractedData.communicationMethods || [],
          access_code: accessCode,
        },
        { onConflict: "id" }
      );

    if (companyError) {
      console.error("[Onboarding Complete] Company error:", companyError);
      throw companyError;
    }

    // Save conversation to knowledge base
    const knowledgeContent = `Company: ${extractedData.companyName}
Industry: ${extractedData.industry}
Locations: ${extractedData.numLocations || "Unknown"}
Workers: ${extractedData.numWorkers || "Unknown"}
Pain Points: ${(extractedData.painPoints || []).join(", ")}
Communication Methods: ${(extractedData.communicationMethods || []).join(", ")}`;

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .insert({
        company_id: companyId,
        name: "Onboarding Interview",
        content: knowledgeContent,
      })
      .select()
      .single();

    if (docError) {
      console.error("[Onboarding Complete] Doc error:", docError);
    }

    const twilioNumber = process.env.TWILIO_PHONE_NUMBER || "+1 (888) 707-4659";

    console.log("[Onboarding Complete] SUCCESS");
    return NextResponse.json({
      success: true,
      companyId,
      companyName: extractedData.companyName,
      industry: extractedData.industry,
      accessCode,
      twilioNumber,
      joinCommand: "JOIN " + accessCode,
    });
  } catch (error) {
    console.error("[Onboarding Complete] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to complete onboarding",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
