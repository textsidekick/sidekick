import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { put, list, del } from "@vercel/blob";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface Worker {
  phone: string;
  company: string;
  location: string;
  language: string;
  joinedAt: string;
}

interface Manager {
  phone: string;
  company: string;
  name: string;
  registeredAt: string;
}

async function getWorkers(): Promise<Worker[]> {
  try {
    const { blobs } = await list({ prefix: 'workers.json' });
    if (blobs.length === 0) return [];
    const response = await fetch(blobs[0].url);
    return await response.json();
  } catch (e) {
    console.error("[SMS] getWorkers error:", e);
    return [];
  }
}

async function saveWorkers(workers: Worker[]): Promise<void> {
  const { blobs } = await list({ prefix: 'workers.json' });
  for (const blob of blobs) await del(blob.url);
  await put('workers.json', JSON.stringify(workers), { access: 'public', addRandomSuffix: false });
}

async function getManagers(): Promise<Manager[]> {
  try {
    const { blobs } = await list({ prefix: 'managers.json' });
    if (blobs.length === 0) return [];
    const response = await fetch(blobs[0].url);
    return await response.json();
  } catch (e) {
    console.error("[SMS] getManagers error:", e);
    return [];
  }
}

async function saveManagers(managers: Manager[]): Promise<void> {
  const { blobs } = await list({ prefix: 'managers.json' });
  for (const blob of blobs) await del(blob.url);
  await put('managers.json', JSON.stringify(managers), { access: 'public', addRandomSuffix: false });
}

async function getDocuments(companyId: string): Promise<any[]> {
  try {
    const { blobs } = await list({ prefix: `documents-${companyId}.json` });
    if (blobs.length === 0) return [];
    const response = await fetch(blobs[0].url);
    return await response.json();
  } catch (e) {
    console.error("[SMS] getDocuments error:", e);
    return [];
  }
}

async function saveDocuments(companyId: string, documents: any[]): Promise<void> {
  const { blobs } = await list({ prefix: `documents-${companyId}.json` });
  for (const blob of blobs) await del(blob.url);
  await put(`documents-${companyId}.json`, JSON.stringify(documents), { access: 'public', addRandomSuffix: false });
}

async function getCompanies(): Promise<any[]> {
  try {
    const { blobs } = await list({ prefix: 'companies.json' });
    if (blobs.length === 0) return [];
    const response = await fetch(blobs[0].url);
    return await response.json();
  } catch (e) {
    console.error("[SMS] getCompanies error:", e);
    return [];
  }
}

async function processImageWithVision(imageUrl: string, companyName: string): Promise<{ success: boolean; chunks: string[]; summary: string }> {
  try {
    console.log("[SMS] Processing image with Claude Vision:", imageUrl);
    
    // Twilio media URLs require authentication
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    
    const imageResponse = await fetch(imageUrl, {
      headers: {
        "Authorization": `Basic ${auth}`
      }
    });
    
    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
    
    // Make sure we got an actual image, not an error page
    if (!contentType.startsWith('image/')) {
      console.error("[SMS] Got non-image response:", contentType);
      return { success: false, chunks: [], summary: "Failed to fetch image from Twilio" };
    }
    
    const base64Image = Buffer.from(imageBuffer).toString('base64');
    
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [{
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: contentType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
              data: base64Image,
            },
          },
          {
            type: "text",
            text: `This is a workplace photo from ${companyName}. Extract useful information workers might need - schedules, rules, policies, contact info, etc.

Return ONLY JSON:
{
  "summary": "Brief description",
  "qa_pairs": [{"question": "...", "answer": "..."}]
}

If no useful info: {"summary": "No relevant workplace information found", "qa_pairs": []}`
          }
        ]
      }]
    });

    const responseText = response.content[0].type === "text" ? response.content[0].text : "{}";
    const cleaned = responseText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    const chunks = parsed.qa_pairs?.map((qa: any) => `Q: ${qa.question}\nA: ${qa.answer}`) || [];
    
    return { success: true, chunks, summary: parsed.summary || "Image processed" };
  } catch (e) {
    console.error("[SMS] Vision processing error:", e);
    return { success: false, chunks: [], summary: "Failed to process image" };
  }
}

async function transcribeAudio(audioUrl: string): Promise<string | null> {
  try {
    console.log("[SMS] Transcribing audio with Deepgram:", audioUrl);
    
    // Fetch audio with Twilio auth
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    
    const audioResponse = await fetch(audioUrl, {
      headers: { "Authorization": `Basic ${auth}` }
    });
    
    const audioBuffer = await audioResponse.arrayBuffer();
    const contentType = audioResponse.headers.get('content-type') || 'audio/amr';
    console.log("[SMS] Audio fetched, size:", audioBuffer.byteLength, "type:", contentType);
    
    // Send to Deepgram (supports AMR natively + auto language detection!)
    const deepgramResponse = await fetch('https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true&detect_language=true', {
      method: 'POST',
      headers: {
        'Authorization': `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': contentType,
      },
      body: audioBuffer,
    });
    
    console.log("[SMS] Deepgram status:", deepgramResponse.status);
    
    if (!deepgramResponse.ok) {
      const errorText = await deepgramResponse.text();
      console.error("[SMS] Deepgram error:", errorText);
      return null;
    }
    
    const result = await deepgramResponse.json();
    const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript || null;
    console.log("[SMS] Transcription:", transcript);
    return transcript;
  } catch (e) {
    console.error("[SMS] Audio transcription error:", e);
    return null;
  }
}

function detectLanguage(text: string): string {
  if (/[\u4e00-\u9fff]/.test(text)) return "zh";
  if (/[\uac00-\ud7af]/.test(text)) return "ko";
  if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text)) return "vi";
  if (/\b(hola|donde|cuando|como|que|por favor|gracias|trabajo)\b/i.test(text)) return "es";
  return "en";
}

async function sendSMS(to: string, body: string): Promise<void> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_PHONE_NUMBER;

  console.log("[SMS] sendSMS called, to:", to, "hasCredentials:", !!accountSid && !!authToken && !!fromNumber);

  if (!accountSid || !authToken || !fromNumber) {
    console.error("[SMS] Missing Twilio credentials");
    return;
  }

  try {
    const url = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${auth}`,
      },
      body: new URLSearchParams({ To: to, From: fromNumber, Body: body }),
    });
    
    console.log("[SMS] Twilio response status:", res.status);
    if (!res.ok) {
      const errorText = await res.text();
      console.error("[SMS] Twilio error:", errorText);
    }
  } catch (e) {
    console.error("[SMS] sendSMS error:", e);
  }
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '').slice(-10);
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    let body: string;
    let from: string;
    let mediaUrl: string | null = null;
    let mediaType: string | null = null;
    let numMedia = 0;
    
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      body = formData.get("Body")?.toString() || "";
      from = formData.get("From")?.toString() || "";
      numMedia = parseInt(formData.get("NumMedia")?.toString() || "0");
      if (numMedia > 0) {
        mediaUrl = formData.get("MediaUrl0")?.toString() || null;
        mediaType = formData.get("MediaContentType0")?.toString() || null;
      }
    } else {
      const json = await request.json();
      body = json.Body || json.message || "";
      from = json.From || json.from || "";
      mediaUrl = json.MediaUrl0 || null;
      mediaType = json.MediaContentType0 || null;
      numMedia = json.NumMedia || 0;
    }

    console.log(`[SMS] From: ${from} | Message: ${body} | Media: ${numMedia} | Type: ${mediaType}`);

    console.log("[SMS] Loading data...");
    const workers = await getWorkers();
    const managers = await getManagers();
    const companies = await getCompanies();
    console.log("[SMS] Loaded:", workers.length, "workers,", managers.length, "managers,", companies.length, "companies");
    
    const normalizedFrom = normalizePhone(from);
    const manager = managers.find(m => normalizePhone(m.phone) === normalizedFrom);
    const worker = workers.find(w => w.phone === from);
    
    console.log("[SMS] Is manager:", !!manager, "Is worker:", !!worker);
    
    // Handle MANAGE command
    const manageMatch = body.match(/^manage\s+(.+)/i);
    if (manageMatch) {
      console.log("[SMS] MANAGE command detected");
      const companySearch = manageMatch[1].trim().toLowerCase();
      const company = companies.find(c => c.name.toLowerCase().includes(companySearch) || c.id.includes(companySearch));
      
      if (company) {
        console.log("[SMS] Found company:", company.name);
        const existingIndex = managers.findIndex(m => normalizePhone(m.phone) === normalizedFrom);
        const newManager: Manager = {
          phone: from,
          company: company.id,
          name: "",
          registeredAt: new Date().toISOString(),
        };
        
        if (existingIndex >= 0) {
          managers[existingIndex] = newManager;
        } else {
          managers.push(newManager);
        }
        
        console.log("[SMS] Saving manager...");
        await saveManagers(managers);
        console.log("[SMS] Manager saved, sending response...");
        
        await sendSMS(from, `✅ You're now registered as a manager for ${company.name}!\n\n📸 Text me photos of schedules or signs\n🎤 Send voice messages\n📝 Or text facts like "Parking is in Lot B"`);
        console.log("[SMS] Response sent");
      } else {
        console.log("[SMS] Company not found");
        await sendSMS(from, `Company not found. Available:\n${companies.map(c => c.name).join(", ")}`);
      }
      
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?><Response></Response>`,
        { headers: { "Content-Type": "text/xml" } }
      );
    }

    // Handle manager sending image
    if (manager && mediaUrl && mediaType?.startsWith("image/")) {
      console.log("[SMS] Manager sending image");
      const company = companies.find(c => c.id === manager.company);
      const result = await processImageWithVision(mediaUrl, company?.name || "");
      
      if (result.success && result.chunks.length > 0) {
        const documents = await getDocuments(manager.company);
        documents.push({
          id: `photo-${Date.now()}`,
          name: "Photo Upload via SMS",
          chunks: result.chunks,
          uploadedAt: new Date().toISOString(),
        });
        await saveDocuments(manager.company, documents);
        await sendSMS(from, `📸 Got it! I learned ${result.chunks.length} thing(s):\n\n${result.summary}`);
      } else {
        await sendSMS(from, `📸 Couldn't extract info from that image. Try a clearer photo.`);
      }
      
      return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, { headers: { "Content-Type": "text/xml" } });
    }

    // Handle manager sending audio
    if (manager && mediaUrl && mediaType?.startsWith("audio/")) {
      console.log("[SMS] Manager sending audio");
      const transcription = await transcribeAudio(mediaUrl);
      
      if (transcription && transcription.length > 5) {
        const company = companies.find(c => c.id === manager.company);
        
        try {
          const response = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{ role: "user", content: `Convert to Q&A for ${company?.name || "workplace"}:\n\n"${transcription}"\n\nReturn ONLY: [{"question":"...","answer":"..."}]` }]
          });
          const text = response.content[0].type === "text" ? response.content[0].text : "[]";
          const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const qaPairs = JSON.parse(cleaned);
          const chunks = qaPairs.map((qa: any) => `Q: ${qa.question}\nA: ${qa.answer}`);
          
          if (chunks.length > 0) {
            const documents = await getDocuments(manager.company);
            documents.push({
              id: `voice-${Date.now()}`,
              name: "Voice Message via SMS",
              chunks,
              uploadedAt: new Date().toISOString(),
            });
            await saveDocuments(manager.company, documents);
            await sendSMS(from, `🎤 Got it! I learned ${chunks.length} thing(s) from your voice message:\n\n"${transcription.slice(0, 100)}${transcription.length > 100 ? '...' : ''}"`);
          } else {
            await sendSMS(from, `🎤 I heard you but couldn't extract workplace info. Try again?`);
          }
        } catch (e) {
          console.error("[SMS] Error processing voice:", e);
          await sendSMS(from, `🎤 Couldn't process that voice message. Try again?`);
        }
      } else {
        await sendSMS(from, `🎤 I couldn't transcribe that audio. Try speaking more clearly or send a text instead.`);
      }
      
      return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, { headers: { "Content-Type": "text/xml" } });
    }

    // Handle manager sending text
    if (manager && body && !body.toLowerCase().startsWith("join") && !body.toLowerCase().startsWith("manage")) {
      const isQuestion = body.trim().endsWith("?") || /^(what|where|when|how|who|why)\b/i.test(body);
      
      if (!isQuestion && body.length > 10) {
        console.log("[SMS] Manager adding knowledge via text");
        const company = companies.find(c => c.id === manager.company);
        
        try {
          const response = await anthropic.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 1000,
            messages: [{ role: "user", content: `Convert to Q&A for ${company?.name || "workplace"}:\n\n"${body}"\n\nReturn ONLY: [{"question":"...","answer":"..."}]` }]
          });
          const text = response.content[0].type === "text" ? response.content[0].text : "[]";
          const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
          const qaPairs = JSON.parse(cleaned);
          const chunks = qaPairs.map((qa: any) => `Q: ${qa.question}\nA: ${qa.answer}`);
          
          if (chunks.length > 0) {
            const documents = await getDocuments(manager.company);
            documents.push({
              id: `text-${Date.now()}`,
              name: "SMS Knowledge",
              chunks,
              uploadedAt: new Date().toISOString(),
            });
            await saveDocuments(manager.company, documents);
            await sendSMS(from, `📝 Got it! Added to knowledge base.`);
          }
        } catch (e) {
          console.error("[SMS] Error processing text:", e);
          await sendSMS(from, `Couldn't process that. Try again.`);
        }
        
        return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, { headers: { "Content-Type": "text/xml" } });
      }
    }
    
    // Handle JOIN command
    const joinMatch = body.match(/^join\s+(.+)/i);
    if (joinMatch) {
      console.log("[SMS] JOIN command");
      const joinText = joinMatch[1].trim().toLowerCase();
      
      let matchedCompany = null;
      let matchedLocation = null;
      
      for (const company of companies) {
        for (const location of company.locations || []) {
          const searchStr = `${company.name} ${location.city}`.toLowerCase();
          if (searchStr.includes(joinText) || joinText.includes(company.name.toLowerCase())) {
            matchedCompany = company;
            matchedLocation = location;
            break;
          }
        }
        if (matchedCompany) break;
      }
      
      if (matchedCompany && matchedLocation) {
        const newWorker: Worker = {
          phone: from,
          company: matchedCompany.id,
          location: matchedLocation.id,
          language: "en",
          joinedAt: new Date().toISOString(),
        };
        
        const idx = workers.findIndex(w => w.phone === from);
        if (idx >= 0) workers[idx] = newWorker;
        else workers.push(newWorker);
        
        await saveWorkers(workers);
        await sendSMS(from, `✅ Welcome to ${matchedCompany.name} - ${matchedLocation.city}!\n\nJust text me any question! 🎉`);
      } else {
        await sendSMS(from, `Company not found. Check spelling or ask your manager.`);
      }
      
      return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, { headers: { "Content-Type": "text/xml" } });
    }

    // Not registered
    if (!worker && !manager) {
      console.log("[SMS] Unregistered user");
      await sendSMS(from, `👋 Welcome to Sidekick!\n\n📱 Workers: JOIN [company]\n👔 Managers: MANAGE [company]`);
      return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, { headers: { "Content-Type": "text/xml" } });
    }

    // Worker question
    console.log("[SMS] Worker question");
    const companyId = worker?.company || manager?.company || "";
    const documents = await getDocuments(companyId);
    const language = detectLanguage(body);

    const allChunks: string[] = [];
    for (const doc of documents) {
      if (doc.chunks) allChunks.push(...doc.chunks);
    }

    let response: string;

    if (allChunks.length === 0) {
      response = "I don't have any info set up yet. Please contact your manager.";
    } else {
      try {
        const company = companies.find(c => c.id === companyId);
        const claudeResponse = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          system: `You're Sidekick, SMS assistant for ${company?.name || "this company"}. Be concise. Use knowledge base only. Add emoji.`,
          messages: [{ role: "user", content: `Knowledge:\n${allChunks.join("\n\n")}\n\nQuestion: ${body}` }]
        });
        response = claudeResponse.content[0].type === "text" ? claudeResponse.content[0].text : "Please try again.";
      } catch (e) {
        console.error("[SMS] Claude error:", e);
        response = "Sorry, error occurred. Try again.";
      }
    }

    await sendSMS(from, response);
    console.log(`[SMS] Done in ${Date.now() - startTime}ms`);

    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, { headers: { "Content-Type": "text/xml" } });
    
  } catch (error) {
    console.error("[SMS] FATAL ERROR:", error);
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, { headers: { "Content-Type": "text/xml" } });
  }
}

export async function GET() {
  return NextResponse.json({ status: "SMS endpoint active" });
}
