import { NextResponse } from "next/server";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

function isValidEmail(email: string) {
  // simple + effective
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function isValidDate(dateStr: string) {
  // YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) return false;
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() === m - 1 &&
    dt.getUTCDate() === d
  );
}

const QUESTIONS = [
  "What’s your preferred first name?",
  "Which department will you be working in?",
  "Who is your supervisor or manager?",
  "What is your preferred contact email?",
  "When is your first day? (YYYY-MM-DD)",
];

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const step = Number(body?.step ?? 1); // 1..5
    const answer = String(body?.answer ?? "").trim();

    // Guard step range
    const currentStep = Number.isFinite(step) && step >= 1 && step <= 5 ? step : 1;

    // Validation gates for email/date
    if (currentStep === 4) {
      if (!isValidEmail(answer)) {
        return NextResponse.json({
          reply:
            "That doesn’t look like a valid email. Please enter something like name@company.com.",
          nextStep: 4,
          done: false,
        });
      }
      return NextResponse.json({
        reply: QUESTIONS[4 - 1 + 1], // next question (step 5)
        nextStep: 5,
        done: false,
      });
    }

    if (currentStep === 5) {
      if (!isValidDate(answer)) {
        return NextResponse.json({
          reply:
            "Please enter your first day in YYYY-MM-DD format (example: 2025-12-26).",
          nextStep: 5,
          done: false,
        });
      }
      // ONLY valid completion path:
      return NextResponse.json({
        reply:
          "🎉 Thanks — you’re all set! We’ll reach out soon with your next steps. Welcome to the team!",
        nextStep: 5,
        done: true,
      });
    }

    // For steps 1–3, accept anything non-empty; if empty, ask again
    if (!answer) {
      return NextResponse.json({
        reply: `Quick one — ${QUESTIONS[currentStep - 1]}`,
        nextStep: currentStep,
        done: false,
      });
    }

    const nextStep = Math.min(currentStep + 1, 5);

    return NextResponse.json({
      reply: QUESTIONS[nextStep - 1],
      nextStep,
      done: false,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error in /api/chat. Please try again." },
      { status: 500 }
    );
  }
}
