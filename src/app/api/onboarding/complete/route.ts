import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";
import { normalizePhoneNumber } from "@/lib/phone";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "sk-placeholder",
});

function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request: NextRequest) {
  console.log("[Complete] ===== START =====");

  try {
    const body = await request.json();
    const { messages } = body;

    if (!messages?.length) {
      console.error("[Complete] No messages");
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    console.log("[Complete] Extracting from", messages.length, "messages");

    // Format conversation
    const conversationText = messages
      .map((m: any) => `${m.role}: ${m.content}`)
      .join("\n");

    // Extract data from conversation
    const extractionPrompt = `Extract ONLY these fields from this conversation:
- companyName: company name (required, string)
- managerName: manager/contact name (string or null)
- managerPhone: manager phone number (string or null)

Conversation:
${conversationText}

Return ONLY valid JSON, no markdown. Example:
{"companyName":"Acme Corp","managerName":"John","managerPhone":"5551234567"}`;

    console.log("[Complete] Calling Anthropic for extraction...");

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5",
      max_tokens: 256,
      messages: [{ role: "user", content: extractionPrompt }],
    });

    const rawText =
      response.content[0]?.type === "text" ? response.content[0].text : "";
    console.log("[Complete] Raw response:", rawText);

    // Parse JSON (handle markdown wrapping)
    let cleanJson = rawText.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson
        .replace(/^```(?:json)?\s*\n?/, "")
        .replace(/\n?```$/, "");
    }

    let extractedData;
    try {
      extractedData = JSON.parse(cleanJson);
      console.log("[Complete] Extracted:", extractedData);
    } catch (e) {
      console.error("[Complete] Parse failed:", cleanJson);
      return NextResponse.json(
        {
          error: "Failed to extract company information",
          details: `Invalid response: ${cleanJson}`,
        },
        { status: 400 }
      );
    }

    // Validate required field
    if (!extractedData.companyName) {
      console.error("[Complete] No company name in extraction");
      return NextResponse.json(
        { error: "Could not extract company name from conversation" },
        { status: 400 }
      );
    }

    // Generate access code
    let accessCode = generateAccessCode();
    let attempts = 0;

    while (attempts < 10) {
      const { data: existing, error: checkError } = await supabase
        .from("companies")
        .select("id")
        .eq("access_code", accessCode)
        .maybeSingle();

      if (checkError) {
        console.error("[Complete] Check code error:", checkError);
        throw checkError;
      }

      if (!existing) break;
      accessCode = generateAccessCode();
      attempts++;
    }

    console.log("[Complete] Using access code:", accessCode);

    // Normalize phone if present
    let managerPhone = null;
    if (extractedData.managerPhone) {
      try {
        managerPhone = normalizePhoneNumber(extractedData.managerPhone);
      } catch (e) {
        console.warn("[Complete] Phone normalization failed:", e);
      }
    }

    // Create company
    const companyId = crypto.randomUUID();
    console.log("[Complete] Creating company:", companyId);

    const { error: insertError } = await supabase.from("companies").insert({
      id: companyId,
      name: extractedData.companyName,
      access_code: accessCode,
      manager_name: extractedData.managerName || null,
      manager_phone: managerPhone,
      onboarding_completed: true,
    });

    if (insertError) {
      console.error("[Complete] Insert failed:", insertError);
      throw insertError;
    }

    console.log("[Complete] Company created successfully");

    const twilioNumber = "+1 (888) 707-4659";

    return NextResponse.json({
      success: true,
      companyId,
      companyName: extractedData.companyName,
      accessCode,
      twilioNumber,
      joinCommand: "JOIN " + accessCode,
    });
  } catch (error) {
    console.error("[Complete] FATAL:", error);
    const message =
      error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      {
        error: "Failed to complete onboarding",
        details: message,
      },
      { status: 500 }
    );
  }
}
