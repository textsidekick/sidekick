// app/api/contact/route.ts
// Receives demo-request submissions from the Contact form and emails
// the team via Resend. Falls back to console.log in dev when RESEND_API_KEY
// isn't set so you can develop without sending real mail.

import { NextResponse } from "next/server";

export const runtime = "nodejs";

const TO = process.env.CONTACT_TO_EMAIL || "hello@textsidekick.com";
const FROM = process.env.CONTACT_FROM_EMAIL || "Sidekick <hello@textsidekick.com>";

type Body = {
  name?: string;
  company?: string;
  email?: string;
  message?: string;
  size?: string;
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, company, email, message, size } = body;

  if (!name || !company || !email || !message) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Invalid email address" },
      { status: 400 },
    );
  }

  const subject = `Sidekick demo request — ${company}`;
  const html = `
    <h2>New demo request</h2>
    <p><strong>Name:</strong> ${escapeHtml(name)}</p>
    <p><strong>Company:</strong> ${escapeHtml(company)}</p>
    ${size ? `<p><strong>Workforce size:</strong> ${escapeHtml(size)}</p>` : ""}
    <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
    <p><strong>Message:</strong></p>
    <p style="white-space:pre-wrap;">${escapeHtml(message)}</p>
  `.trim();

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("[contact] No RESEND_API_KEY — logging submission instead:");
    console.log({ to: TO, from: FROM, subject, name, company, email, message });
    return NextResponse.json({ ok: true, dev: true });
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [TO],
        reply_to: email,
        subject,
        html,
      }),
    });

    if (!r.ok) {
      const text = await r.text();
      console.error("[contact] Resend error:", r.status, text);
      return NextResponse.json(
        { error: "Email service rejected the request" },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Resend exception:", err);
    return NextResponse.json(
      { error: "Could not send email" },
      { status: 500 },
    );
  }
}
