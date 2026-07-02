/**
 * WhatsApp messaging via Twilio API.
 * Twilio uses the same Messages API — just prefix the phone number with "whatsapp:".
 */
import twilio from "twilio";

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID || "AC00000000000000000000000000000000",
  process.env.TWILIO_AUTH_TOKEN || "placeholder"
);

/**
 * Send a WhatsApp message via Twilio.
 * @param to  E.164 phone number (WITHOUT the "whatsapp:" prefix — we add it)
 * @param body  Message text
 * @param mediaUrl  Optional media attachment URL
 */
export async function sendWhatsApp(
  to: string,
  body: string,
  mediaUrl?: string
): Promise<boolean> {
  try {
    const params: any = {
      body,
      from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER || process.env.TWILIO_PHONE_NUMBER}`,
      to: to.startsWith("whatsapp:") ? to : `whatsapp:${to}`,
    };
    if (mediaUrl) {
      params.mediaUrl = [mediaUrl];
    }
    await twilioClient.messages.create(params);
    return true;
  } catch (error) {
    console.error("[WhatsApp] Failed to send:", error);
    return false;
  }
}

/**
 * Detect whether an incoming Twilio webhook is from WhatsApp.
 * Twilio prefixes the From/To fields with "whatsapp:" for WhatsApp messages.
 */
export function isWhatsAppMessage(from: string): boolean {
  return from.startsWith("whatsapp:");
}

/**
 * Strip the "whatsapp:" prefix to get the raw E.164 number.
 */
export function stripWhatsAppPrefix(phone: string): string {
  return phone.replace(/^whatsapp:/, "");
}

/**
 * Send a message via the appropriate channel.
 */
export async function sendMessage(
  to: string,
  body: string,
  channel: "sms" | "whatsapp" | "both",
  mediaUrl?: string
): Promise<boolean> {
  const results: boolean[] = [];

  if (channel === "sms" || channel === "both") {
    try {
      const params: any = {
        body,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
      };
      if (mediaUrl) params.mediaUrl = [mediaUrl];
      await twilioClient.messages.create(params);
      results.push(true);
    } catch (error) {
      console.error("[SMS] Failed to send:", error);
      results.push(false);
    }
  }

  if (channel === "whatsapp" || channel === "both") {
    results.push(await sendWhatsApp(to, body, mediaUrl));
  }

  return results.some(Boolean);
}
