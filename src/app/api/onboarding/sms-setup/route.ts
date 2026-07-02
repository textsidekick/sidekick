export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { normalizePhoneNumber } from "@/lib/phone";
import { randomBytes } from "crypto";
import { detectLanguage, translateText } from "@/lib/language";

const INDUSTRY_MAP: Record<string, string> = {
  "1": "Manufacturing",
  "2": "Food & Beverage",
  "3": "Automotive",
  "4": "Other",
};

function generateJoinCode(): string {
  return randomBytes(3).toString("hex").toUpperCase(); // e.g. "A1B2C3"
}

/**
 * Handle one step of the SMS onboarding flow.
 * Called from the SMS webhook when the phone has an active onboarding session,
 * or when someone texts "SETUP".
 *
 * Returns { message: string } to send back via SMS.
 */
export async function handleSmsOnboarding(
  phone: string,
  body: string,
  mediaUrl?: string
): Promise<{ message: string }> {
  // Detect language from the first meaningful text and persist it in session
  let lang = "en";
  const normalizedPhone = normalizePhoneNumber(phone);
  const text = body.trim();
  const upperText = text.toUpperCase();

  // Fetch existing session
  const { data: session } = await supabase
    .from("onboarding_sessions")
    .select("*")
    .eq("phone", normalizedPhone)
    .single();

  // Step 0: No session yet — expect "SETUP"
  if (!session) {
    if (upperText === "SETUP") {
      // Detect language from any text around SETUP
      if (text.length > 5) lang = await detectLanguage(text);
      await supabase.from("onboarding_sessions").insert({
        phone: normalizedPhone,
        step: 1,
        data: { lang },
      });
      const msg = "Welcome to Sidekick! 🎉 What's your company name?";
      return { message: lang !== "en" ? await translateText(msg, lang) : msg };
    }
    const msg = 'Text "SETUP" to start setting up your company with Sidekick.';
    return { message: msg };
  }

  const sessionData = (session.data as Record<string, unknown>) || {};

  // Restore language from session
  lang = (sessionData.lang as string) || "en";
  // Re-detect on first meaningful text if not yet detected
  if (lang === "en" && text.length > 3 && session.step <= 2) {
    const detected = await detectLanguage(text);
    if (detected !== "en") {
      lang = detected;
      // Update session with detected language
      await supabase
        .from("onboarding_sessions")
        .update({ data: { ...sessionData, lang } })
        .eq("phone", normalizedPhone);
    }
  }

  // Helper to translate outgoing messages
  const t = async (msg: string) => lang !== "en" ? await translateText(msg, lang) : msg;

  switch (session.step) {
    case 1: {
      // Expecting company name
      if (!text || text.length < 2) {
        return { message: await t("Please enter your company name.") };
      }
      await supabase
        .from("onboarding_sessions")
        .update({ step: 2, data: { ...sessionData, company_name: text, lang } })
        .eq("phone", normalizedPhone);
      return {
        message: await t(
          "Got it! What type of business?\n1 = Manufacturing\n2 = Food & Beverage\n3 = Automotive\n4 = Other\n\nReply with a number."
        ),
      };
    }

    case 2: {
      // Expecting industry choice (1-4)
      const industry = INDUSTRY_MAP[text];
      if (!industry) {
        return { message: await t("Please reply with 1, 2, 3, or 4.") };
      }
      await supabase
        .from("onboarding_sessions")
        .update({ step: 3, data: { ...sessionData, industry } })
        .eq("phone", normalizedPhone);
      return { message: await t("How many workers are on your floor?") };
    }

    case 3: {
      // Expecting worker count
      const count = parseInt(text, 10);
      if (isNaN(count) || count < 1) {
        return { message: await t("Please enter a number (e.g. 25).") };
      }
      await supabase
        .from("onboarding_sessions")
        .update({ step: 4, data: { ...sessionData, worker_count: count } })
        .eq("phone", normalizedPhone);
      return {
        message: await t(
          "Want to upload a photo of your floor or equipment so I can catalog it?\n\nReply PHOTO and send a picture, or SKIP to continue."
        ),
      };
    }

    case 4: {
      // Expecting PHOTO (with media), SKIP, or an MMS image
      if (upperText === "SKIP") {
        return await completeOnboarding(normalizedPhone, sessionData, lang);
      }

      // Check for incoming MMS media
      if (mediaUrl) {
        try {
          const photoRes = await fetch(
            `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/onboarding/photo-asset`,
            {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({ image: mediaUrl }),
            }
          );
          const photoData = await photoRes.json();
          const urls = (sessionData.floor_photo_urls as string[]) || [];
          urls.push(mediaUrl);
          await supabase
            .from("onboarding_sessions")
            .update({
              step: 4, // stay on step 4 to allow more photos or SKIP
              data: {
                ...sessionData,
                floor_photo_urls: urls,
                cataloged_assets: [
                  ...((sessionData.cataloged_assets as unknown[]) || []),
                  ...(photoData.assets || []),
                ],
              },
            })
            .eq("phone", normalizedPhone);
          const assetCount = photoData.assets?.length || 0;
          return {
            message: await t(`Found ${assetCount} piece(s) of equipment! Send another photo or reply DONE when finished.`),
          };
        } catch {
          return { message: await t("Couldn't process that photo. Try again or reply SKIP.") };
        }
      }

      if (upperText === "DONE") {
        // Re-fetch session data since photos may have been added
        const { data: refreshed } = await supabase
          .from("onboarding_sessions")
          .select("data")
          .eq("phone", normalizedPhone)
          .single();
        return await completeOnboarding(normalizedPhone, (refreshed?.data as Record<string, unknown>) || sessionData, lang);
      }

      if (upperText === "PHOTO") {
        return { message: await t("Send me a photo of your floor or equipment!") };
      }

      return { message: await t("Reply PHOTO to send a picture, DONE if finished, or SKIP to continue without photos.") };
    }

    case 5: {
      // Already completed
      return {
        message: await t(`You're already set up! Your company: ${sessionData.company_name}. Workers can text this number with any question.`),
      };
    }

    default:
      return { message: await t('Something went wrong. Text "SETUP" to start over.') };
  }
}

async function completeOnboarding(
  phone: string,
  data: Record<string, unknown>,
  lang: string = "en"
): Promise<{ message: string }> {
  const joinCode = generateJoinCode();
  const companyName = (data.company_name as string) || "Your Company";

  // Create the company in Supabase
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .insert({
      name: companyName,
      industry: data.industry || "Other",
      join_code: joinCode,
      manager_phone: phone,
      worker_count: data.worker_count || 0,
      default_language: lang || "en",
    })
    .select("id")
    .single();

  const companyId = company?.id || null;

  if (companyError) {
    console.error("[sms-setup] Failed to create company:", companyError);
  }

  // If we cataloged assets, insert them
  if (companyId && Array.isArray(data.cataloged_assets)) {
    for (const asset of data.cataloged_assets as Record<string, string>[]) {
      try {
        await supabase.from("assets").insert({
          company_id: companyId,
          name: asset.name || "Unknown Equipment",
          type: asset.type || "Other",
          manufacturer: asset.manufacturer || null,
          model: asset.model || null,
          location: asset.location || null,
          tag: asset.tag || null,
        });
      } catch (e) {
        console.error("[sms-setup] Failed to insert asset:", e);
      }
    }
  }

  // Mark session complete
  await supabase
    .from("onboarding_sessions")
    .update({
      step: 5,
      completed_at: new Date().toISOString(),
      company_id: companyId,
      data: { ...data, join_code: joinCode },
    })
    .eq("phone", phone);

  const finalMsg = `You're all set! 🎉\n\nYour company: ${companyName}\nJoin code: ${joinCode}\n\nWorkers can now text this number with any question. Text me anything and I'll learn!`;
  return {
    message: lang !== "en" ? await translateText(finalMsg, lang) : finalMsg,
  };
}

// POST endpoint (can be called directly for testing)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const phone = formData.get("From") as string;
    const body = (formData.get("Body") as string) || "";
    const mediaUrl = (formData.get("MediaUrl0") as string) || undefined;

    if (!phone) {
      return NextResponse.json({ error: "Missing phone number" }, { status: 400 });
    }

    const result = await handleSmsOnboarding(phone, body, mediaUrl);
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("[sms-setup] Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
