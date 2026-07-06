import { supabase } from "@/lib/supabase";

/**
 * Create a manager session and return the token + Set-Cookie headers.
 */
export async function createManagerSession(companyId: string): Promise<{
  token: string;
  cookieHeaders: string[];
} | null> {
  try {
    // Generate a random hex token
    const arr = new Uint8Array(32);
    for (let i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
    const token = Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await supabase.from("manager_sessions").insert({
      token,
      company_id: companyId,
      expires_at: expiresAt,
    });

    const maxAge = 30 * 24 * 60 * 60;
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

    return {
      token,
      cookieHeaders: [
        "sidekick_session=" + token + "; Path=/; Max-Age=" + maxAge + "; HttpOnly; SameSite=Lax" + secure,
        "sidekick_auth=true; Path=/; Max-Age=" + maxAge + "; SameSite=Lax" + secure,
      ],
    };
  } catch (e) {
    console.warn("[create-session] Failed:", e);
    return null;
  }
}
