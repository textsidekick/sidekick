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

// Generate a memorable code from a company/event name
// e.g. "Acme Manufacturing" → "ACME", "Jim Falk Motors" → "JIMFALK"
function generateNameBasedCode(name: string): string {
  const cleaned = name.toUpperCase().replace(/[^A-Z0-9]/g, "");
  
  // If short enough (≤8 chars), use the whole thing
  if (cleaned.length <= 8) return cleaned;
  
  // Try acronym from words (e.g. "Acme Manufacturing" → "AM")
  const words = name.trim().split(/\s+/).filter(w => w.length > 0);
  const acronym = words.map(w => w[0].toUpperCase()).join("").replace(/[^A-Z]/g, "");
  
  // If acronym is too short, use first 6 chars of cleaned name
  if (acronym.length < 3) return cleaned.slice(0, 6);
  
  return acronym;
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
    const extractionPrompt = `Extract ALL available fields from this onboarding conversation. Include everything mentioned.

REQUIRED:
- companyName: company/event name (string)

OPTIONAL (include if mentioned):
- managerName: manager/organizer name (string or null)
- managerPhone: phone number (string or null)
- industry: industry or event type (string or null)
- workerCount: approximate number of workers/attendees (number or null)
- locations: number of locations/sites (number or null)
- painPoints: main challenges or needs mentioned (string[] or null)
- commonQuestions: types of questions workers/attendees commonly ask (string[] or null)
- wishKnew: what the manager wishes their team just knew (string or null)
- additionalInfo: any other relevant details mentioned (string or null)

Conversation:
${conversationText}

Return ONLY valid JSON, no markdown. Include all fields that have data.`;

    console.log("[Complete] Calling Anthropic for extraction...");

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
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

    // Generate access code based on company name
    let baseCode = generateNameBasedCode(extractedData.companyName);
    let accessCode = baseCode;
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
      // Append a number to make unique
      attempts++;
      accessCode = baseCode + attempts;
    }

    // Fallback to random if all name-based attempts failed
    if (attempts >= 10) accessCode = generateAccessCode();

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
    const companyId = `sidekick-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    console.log("[Complete] Creating company:", companyId, "with code:", accessCode);

    const insertData = {
      id: companyId,
      name: extractedData.companyName,
      access_code: accessCode,
      manager_name: extractedData.managerName || null,
      manager_phone: managerPhone,
      onboarding_completed: true,
      industry: extractedData.industry || null,
      worker_count: extractedData.workerCount || null,
      metadata: JSON.stringify({
        locations: extractedData.locations,
        painPoints: extractedData.painPoints,
        commonQuestions: extractedData.commonQuestions,
        wishKnew: extractedData.wishKnew,
        additionalInfo: extractedData.additionalInfo,
      }),
    };
    
    console.log("[Complete] Insert data:", JSON.stringify(insertData));

    const { data: insertResult, error: insertError } = await supabase
      .from("companies")
      .insert([insertData])
      .select();

    console.log("[Complete] Insert result:", insertResult, "Error:", insertError);

    if (insertError) {
      console.error("[Complete] Insert failed with error:", insertError);
      throw new Error(`Supabase insert failed: ${insertError.message}`);
    }

    if (!insertResult || insertResult.length === 0) {
      console.error("[Complete] Insert returned no data");
      throw new Error("Insert returned no data");
    }

    console.log("[Complete] Company created successfully:", insertResult[0]);

    const twilioNumber = "+1 (888) 707-4659";

    // Auto-load sample knowledge base for instant demo capability
    try {
      const sampleKnowledge = [
        "General Company Policies:\n- Work hours: Check with your manager for your shift schedule\n- Breaks: Two 15-minute breaks and one 30-minute lunch per 8-hour shift\n- PTO: Submit requests through your manager at least 2 weeks in advance\n- Sick days: Notify your manager before your shift starts",
        "Safety Guidelines:\n- Always wear required PPE for your work area\n- Report all injuries immediately to your supervisor\n- Know your emergency exits and assembly points\n- Fire extinguishers at every exit\n- First aid kits at every exit door\n- For emergencies call 911 then notify supervisor",
        "New Employee FAQ:\n- Parking: Employee lot\n- Time off: 2 weeks notice through manager\n- Running late: Call or text supervisor before shift\n- HR issues: Contact manager or HR department",
      ];
      for (const chunk of sampleKnowledge) {
        await supabase.from("document_chunks").insert({
          company_id: companyId,
          content: chunk,
          metadata: { source: "sample", type: "starter-kit" },
        });
      }
    } catch (sampleErr) {
      console.warn("[Complete] Sample KB load failed:", sampleErr);
    }

    // Send welcome SMS to manager
    try {
      const twilioSid = process.env.TWILIO_ACCOUNT_SID;
      const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
      const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
      
      if (twilioSid && twilioAuth && twilioPhone && managerPhone) {
        await fetch(
          `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              Authorization: "Basic " + Buffer.from(`${twilioSid}:${twilioAuth}`).toString("base64"),
            },
            body: new URLSearchParams({
              To: managerPhone,
              From: twilioPhone,
              Body: `Welcome to Sidekick! ${extractedData.companyName} is all set up. Your workers can text JOIN ${accessCode} to ${twilioPhone} to get started. You can manage everything at textsidekick.com/manager. - The Sidekick Team`,
            }),
          }
        );
      }
    } catch (smsErr) {
      console.warn("[Complete] Welcome SMS failed:", smsErr);
    }

    // Send notification email to team
    try {
      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: "Sidekick <notifications@textsidekick.com>",
            to: ["hello@textsidekick.com"],
            subject: `! New signup: ${extractedData.companyName}`,
            html: `<h2>New company signed up!</h2>
              <p><strong>Company:</strong> ${extractedData.companyName}</p>
              <p><strong>Manager:</strong> ${extractedData.managerName || "Not provided"}</p>
              <p><strong>Phone:</strong> ${managerPhone || "Not provided"}</p>
              <p><strong>Access Code:</strong> ${accessCode}</p>
              <p><strong>Plan:</strong> Trial (50 questions / 7 days)</p>
              <hr>
              <p style="color:#666">This is an automated notification from Sidekick onboarding.</p>`,
          }),
        });
      }
    } catch (emailErr) {
      console.warn("[Complete] Email notification failed:", emailErr);
    }

    return NextResponse.json({
      success: true,
      companyId,
      companyName: extractedData.companyName,
      accessCode,
      twilioNumber,
      joinCommand: "JOIN " + accessCode,
    });
  } catch (error) {
    console.error("[Complete] FATAL ERROR:", error);
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Complete] Error message:", message);
    return NextResponse.json(
      {
        error: "Failed to complete onboarding",
        details: message,
      },
      { status: 500 }
    );
  }
}
