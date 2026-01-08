import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

const knowledgeStore: Record<string, any[]> = {};
const interactionLog: any[] = [];
const workers: Record<string, any> = {};

const SAFETY_PATTERNS = /forklift|lockout|tagout|chemical|hazmat|injury|emergency|accident|osha/i;

async function detectLanguage(text: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 50,
    messages: [{ role: "user", content: `What language is this? Reply with just the language name: "${text}"` }]
  });
  return response.content[0].type === "text" ? response.content[0].text.trim() : "English";
}

function findKnowledge(companyId: string, question: string) {
  const knowledge = knowledgeStore[companyId] || [];
  const questionLower = question.toLowerCase();
  let bestMatch = null, bestScore = 0;
  
  for (const item of knowledge) {
    const itemLower = item.question.toLowerCase();
    const words = questionLower.split(/\s+/);
    const matchingWords = words.filter(w => itemLower.includes(w));
    const score = matchingWords.length / words.length;
    if (score > bestScore) { bestScore = score; bestMatch = item; }
  }
  return { item: bestMatch, confidence: Math.round(bestScore * 100) };
}

async function generateResponse(question: string, knowledge: any, confidence: number, companyName: string, lang: string) {
  if (SAFETY_PATTERNS.test(question)) {
    const msg = "This is a safety question. Please speak with your supervisor directly.";
    return { response: lang === "English" ? msg : await translate(msg, lang), topic: "safety" };
  }
  
  const prompt = knowledge && confidence >= 40
    ? `Worker asks: "${question}"\nPolicy: "${knowledge.answer}"\nGive a helpful, concise SMS response (under 160 chars).`
    : `Worker asks: "${question}"\nNo policy found. Suggest they check with supervisor. Under 160 chars.`;
  
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 200,
    messages: [{ role: "user", content: prompt }]
  });
  
  let text = response.content[0].type === "text" ? response.content[0].text : "";
  if (lang !== "English") text = await translate(text, lang);
  return { response: text, topic: classifyTopic(question) };
}

async function translate(text: string, lang: string) {
  const r = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [{ role: "user", content: `Translate to ${lang}. Only return translation: "${text}"` }]
  });
  return r.content[0].type === "text" ? r.content[0].text : text;
}

function classifyTopic(q: string) {
  const ql = q.toLowerCase();
  if (ql.includes("park")) return "parking";
  if (ql.includes("schedule") || ql.includes("shift")) return "schedule";
  if (ql.includes("break") || ql.includes("lunch")) return "breaks";
  if (ql.includes("pay") || ql.includes("commission")) return "compensation";
  return "general";
}

async function sendSMS(to: string, body: string) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) return false;
  await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ To: to, From: TWILIO_PHONE_NUMBER!, Body: body }),
  });
  return true;
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const from = formData.get("From") as string;
  const body = (formData.get("Body") as string || "").trim();
  
  if (!from || !body) return new NextResponse("Missing fields", { status: 400 });
  console.log(`[SMS] ${from}: "${body}"`);

  const joinMatch = body.match(/^join\s+(.+)/i);
  if (joinMatch) {
    workers[from] = { phone: from, companyId: joinMatch[1].toLowerCase().replace(/\s+/g, "-"), language: "English" };
    await sendSMS(from, `Welcome to Sidekick! You're registered with ${joinMatch[1]}. Text any question! 📱`);
    return new NextResponse('<?xml version="1.0"?><Response></Response>', { headers: { "Content-Type": "text/xml" } });
  }

  const worker = workers[from] || { companyId: "eds", language: "English" };
  const lang = await detectLanguage(body);
  const { item, confidence } = findKnowledge(worker.companyId, body);
  const { response, topic } = await generateResponse(body, item, confidence, worker.companyId, lang);
  
  interactionLog.push({ phone: from, question: body, answer: response, confidence, language: lang, topic, timestamp: new Date().toISOString() });
  await sendSMS(from, response);
  
  return new NextResponse('<?xml version="1.0"?><Response></Response>', { headers: { "Content-Type": "text/xml" } });
}

export async function PUT(request: NextRequest) {
  const { companyId, knowledge } = await request.json();
  knowledgeStore[companyId] = [...(knowledgeStore[companyId] || []), ...knowledge];
  return NextResponse.json({ success: true });
}

export async function GET() {
  return NextResponse.json({ interactions: interactionLog, total: interactionLog.length });
}
