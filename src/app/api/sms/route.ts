import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getDocuments } from "../documents/store";
import { getCompanies, getWorkerByPhone, registerWorker, Company, Location } from "../companies/store";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function translateToEnglish(query: string): Promise<{ language: string; englishQuery: string }> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: `Detect language and translate to English. Return ONLY JSON, no markdown:
"${query}"
{"language":"detected language","englishQuery":"English translation"}`
    }]
  });
  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const result = JSON.parse(cleaned);
    return { language: result.language || "English", englishQuery: result.englishQuery || query };
  } catch {
    return { language: "English", englishQuery: query };
  }
}

async function translateResponse(answer: string, targetLanguage: string): Promise<string> {
  if (targetLanguage.toLowerCase() === "english") return answer;
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    messages: [{
      role: "user",
      content: `Translate to ${targetLanguage}. Output ONLY the translation:\n\n${answer}`
    }]
  });
  return response.content[0].type === "text" ? response.content[0].text : answer;
}

// Find matching company and location from user input
async function findCompanyAndLocation(query: string): Promise<{ company?: Company; location?: Location }> {
  const companies = await getCompanies();
  const queryLower = query.toLowerCase().trim();
  
  // Try to find exact location match first (most specific)
  for (const company of companies) {
    for (const location of company.locations) {
      const cityMatch = location.city.toLowerCase();
      const nameMatch = location.name.toLowerCase();
      
      if (queryLower.includes(cityMatch) || queryLower.includes(nameMatch)) {
        // Also check if company name is mentioned
        if (queryLower.includes(company.name.toLowerCase()) || 
            queryLower.includes(company.id.toLowerCase())) {
          return { company, location };
        }
      }
    }
  }
  
  // Try company + city separately
  for (const company of companies) {
    if (queryLower.includes(company.name.toLowerCase()) || 
        queryLower.includes(company.id.toLowerCase())) {
      // Found company, now look for city
      for (const location of company.locations) {
        if (queryLower.includes(location.city.toLowerCase())) {
          return { company, location };
        }
      }
      // Company found but no city - return company with first location as default
      return { company, location: company.locations[0] };
    }
  }
  
  // Try just city name
  for (const company of companies) {
    for (const location of company.locations) {
      if (queryLower.includes(location.city.toLowerCase())) {
        return { company, location };
      }
    }
  }
  
  return {};
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const body = formData.get("Body")?.toString() || "";
  const from = formData.get("From")?.toString() || "";

  console.log("[SMS] From:", from, "| Message:", body);
  
  const msgLower = body.toLowerCase().trim();
  const companies = await getCompanies();

  // HELP command
  if (msgLower === "help" || msgLower === "commands") {
    const companyList = companies.map(c => {
      const cities = c.locations.map(l => l.city).join(", ");
      return `• ${c.name} (${cities})`;
    }).join("\n");
    
    const answer = `📱 Sidekick Commands:\n\n• JOIN [company] [city] - Set your workplace\n• STATUS - Check your registration\n• HELP - Show this message\n\nCompanies:\n${companyList}`;
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${answer}</Message></Response>`;
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  // STATUS command
  if (msgLower === "status" || msgLower === "my company" || msgLower === "where do i work") {
    const worker = await getWorkerByPhone(from);
    let answer: string;
    
    if (worker) {
      const company = companies.find(c => c.id === worker.companyId);
      const location = company?.locations.find(l => l.id === worker.locationId);
      answer = `✅ You're registered at ${company?.name || "Unknown"} - ${location?.city || "Unknown"}, ${location?.state || ""}.\n\nText any question and I'll help! 📋`;
    } else {
      answer = `❓ You're not registered yet.\n\nText: JOIN [company] [city]\n\nExample: JOIN EDS Santa Clara`;
    }
    
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${answer}</Message></Response>`;
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  // JOIN command
  const joinMatch = msgLower.match(/^(?:join|register|work at|i work at|set company|company)\s+(.+)$/i);
  if (joinMatch) {
    const query = joinMatch[1];
    const { company, location } = await findCompanyAndLocation(query);
    
    let answer: string;
    
    if (company && location) {
      await registerWorker(from, company.id, location.id);
      answer = `✅ Welcome to ${company.name} - ${location.city}, ${location.state}!\n\nYou're all set. Just text me any question about schedules, parking, safety, or policies! 🎉`;
    } else if (company) {
      // Company found but need location
      const cities = company.locations.map(l => l.city).join(", ");
      answer = `📍 Which ${company.name} location?\n\nOptions: ${cities}\n\nText: JOIN ${company.name} [city]`;
    } else {
      // Nothing found
      const companyList = companies.map(c => `• ${c.name}`).join("\n");
      answer = `❓ Company not found.\n\nAvailable:\n${companyList}\n\nText: JOIN [company] [city]`;
    }
    
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${answer}</Message></Response>`;
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  // Regular question - check registration
  const worker = await getWorkerByPhone(from);
  
  if (!worker) {
    const companyList = companies.map(c => c.name).join(", ");
    const answer = `👋 Welcome to Sidekick!\n\nFirst, tell me where you work:\nJOIN [company] [city]\n\nExample: JOIN EDS Santa Clara\n\nCompanies: ${companyList}`;
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${answer}</Message></Response>`;
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  const company = companies.find(c => c.id === worker.companyId);
  const location = company?.locations.find(l => l.id === worker.locationId);
  
  if (!company) {
    const answer = "⚠️ Your company registration is invalid. Text HELP to re-register.";
    const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${answer}</Message></Response>`;
    return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
  }

  console.log("[SMS] Worker:", company.name, "-", location?.city);

  // Translate query
  const { language, englishQuery } = await translateToEnglish(body);
  console.log("[SMS] Language:", language, "| English query:", englishQuery);

  // Search documents - use locationId for location-specific docs, fall back to companyId
  const locationDocs = await getDocuments(worker.locationId);
  const companyDocs = await getDocuments(worker.companyId);
  const allDocs = [...locationDocs, ...companyDocs];
  
  const searchWords = englishQuery.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  let relevantChunks: { text: string; score: number }[] = [];

  for (const doc of allDocs) {
    for (const chunk of doc.chunks || []) {
      const chunkLower = chunk.toLowerCase();
      let score = 0;
      for (const word of searchWords) {
        if (chunkLower.includes(word)) score++;
      }
      if (score > 0) relevantChunks.push({ text: chunk, score });
    }
  }

  relevantChunks.sort((a, b) => b.score - a.score);
  relevantChunks = relevantChunks.slice(0, 5);

  let answer: string;

  if (relevantChunks.length > 0 && process.env.ANTHROPIC_API_KEY) {
    const context = relevantChunks.map(c => c.text).join("\n\n---\n\n");
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 400,
      system: `You're a helpful workplace assistant for ${company.name} (${location?.city}, ${location?.state}). Answer based on the documents. Be concise for SMS (under 300 chars). Add a relevant emoji at the end.`,
      messages: [{
        role: "user",
        content: `Documents:\n${context}\n\nQuestion: ${englishQuery}\n\nAnswer concisely:`
      }]
    });
    answer = response.content[0].type === "text" ? response.content[0].text : "Sorry, I couldn't find that information.";
  } else {
    answer = `I don't have info about that for ${company.name} ${location?.city || ""} yet. Please ask your supervisor. 📋`;
  }

  answer = await translateResponse(answer, language);

  const twiml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${answer}</Message></Response>`;
  return new NextResponse(twiml, { headers: { "Content-Type": "text/xml" } });
}
