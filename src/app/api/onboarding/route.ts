import { NextRequest, NextResponse } from "next/server";
import { getCompanies, saveCompanies, Company } from "../companies/store";
import { put, list, del } from "@vercel/blob";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: NextRequest) {
  console.log("[Onboarding] === API HIT ===");
  
  let data: any;
  try {
    data = await request.json();
    console.log("[Onboarding] Parsed JSON successfully");
    console.log("[Onboarding] Company:", data.companyName);
    console.log("[Onboarding] Audio count:", data.audioRecordings?.length || 0);
    if (data.audioRecordings?.length > 0) {
      console.log("[Onboarding] First audio base64 length:", data.audioRecordings[0]?.base64?.length || 0);
    }
  } catch (e) {
    console.error("[Onboarding] JSON parse error:", e);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
    
  if (!data.companyName) {
    return NextResponse.json({ error: "Company name is required" }, { status: 400 });
  }
  
  try {
    const companyId = data.companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
    const locationParts = (data.location || "").split(",").map((s: string) => s.trim());
    const city = locationParts[0] || data.companyName;
    const state = locationParts[1] || "";
    const locationId = `${companyId}-${city.toLowerCase().replace(/\s+/g, "")}`;
    
    console.log("[Onboarding] Creating company:", companyId);
    
    const newCompany: Company = {
      id: companyId,
      name: data.companyName,
      locations: [{ id: locationId, name: `${data.companyName} ${city}`, city, state }],
      createdAt: new Date().toISOString(),
    };
    
    const companies = await getCompanies();
    const existingIndex = companies.findIndex(c => c.id === companyId);
    if (existingIndex >= 0) {
      const existing = companies[existingIndex];
      if (!existing.locations.find(l => l.id === locationId)) {
        existing.locations.push(newCompany.locations[0]);
      }
      companies[existingIndex] = existing;
    } else {
      companies.push(newCompany);
    }
    await saveCompanies(companies);
    console.log("[Onboarding] Company saved");
    
    const allChunks: string[] = [];
    const knowledgeSummary = { seedAnswers: 0, documents: 0, audioNotes: 0, total: 0 };
    
    // Seed answers
    const seedAnswers = data.seedAnswers || {};
    const questionMap: Record<number, string> = { 1: "Where should employees park?", 2: "Which entrance should workers use?", 3: "How do workers clock in?", 4: "What PPE is required?", 5: "How long are breaks?", 6: "What is the phone policy?" };
    for (const [id, answer] of Object.entries(seedAnswers)) {
      const question = questionMap[parseInt(id)];
      if (question && answer) {
        const answerText = Array.isArray(answer) ? answer.join(", ") : String(answer);
        allChunks.push(`Q: ${question}\nA: ${answerText}`);
        knowledgeSummary.seedAnswers++;
      }
    }
    console.log("[Onboarding] Seed answers:", knowledgeSummary.seedAnswers);
    
    if (data.managerName && data.managerPhone) {
      allChunks.push(`Q: Who is my manager?\nA: Your manager is ${data.managerName} at ${data.managerPhone}.`);
      knowledgeSummary.seedAnswers++;
    }
    
    if (data.location) {
      allChunks.push(`Q: Where is the workplace located?\nA: ${data.companyName} is located in ${data.location}.`);
      knowledgeSummary.seedAnswers++;
    }
    
    // Process audio
    if (data.audioRecordings && Array.isArray(data.audioRecordings) && data.audioRecordings.length > 0) {
      console.log("[Onboarding] Processing audio recordings:", data.audioRecordings.length);
      
      for (let i = 0; i < data.audioRecordings.length; i++) {
        const recording = data.audioRecordings[i];
        const base64Length = recording.base64?.length || 0;
        console.log(`[Onboarding] Recording ${i}: base64 length = ${base64Length}`);
        
        if (base64Length > 100 && process.env.OPENAI_API_KEY) {
          console.log("[Onboarding] Attempting Whisper transcription...");
          try {
            const audioBuffer = Buffer.from(recording.base64, "base64");
            console.log("[Onboarding] Buffer created, size:", audioBuffer.length);
            
            const file = new File([audioBuffer], "recording.webm", { type: "audio/webm" });
            const formData = new FormData();
            formData.append("file", file);
            formData.append("model", "whisper-1");
            
            console.log("[Onboarding] Calling Whisper API...");
            const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
              method: "POST",
              headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}` },
              body: formData,
            });
            
            console.log("[Onboarding] Whisper status:", whisperRes.status);
            
            if (whisperRes.ok) {
              const whisperData = await whisperRes.json();
              const transcription = whisperData.text || "";
              console.log("[Onboarding] Transcription:", transcription.slice(0, 100));
              
              if (transcription) {
                console.log("[Onboarding] Calling Claude to extract Q&A...");
                const claudeRes = await anthropic.messages.create({
                  model: "claude-sonnet-4-20250514",
                  max_tokens: 1500,
                  messages: [{ role: "user", content: `Extract Q&A pairs from this voice note about workplace policies:\n\n"${transcription}"\n\nReturn ONLY a JSON array like: [{"question":"...","answer":"..."}]` }]
                });
                
                const claudeText = claudeRes.content[0].type === "text" ? claudeRes.content[0].text : "[]";
                const cleaned = claudeText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
                console.log("[Onboarding] Claude response:", cleaned.slice(0, 100));
                
                try {
                  const qaPairs = JSON.parse(cleaned);
                  for (const qa of qaPairs) {
                    allChunks.push(`Q: ${qa.question}\nA: ${qa.answer}`);
                    knowledgeSummary.audioNotes++;
                  }
                  console.log("[Onboarding] Added", qaPairs.length, "Q&A from audio");
                } catch (parseErr) {
                  console.log("[Onboarding] JSON parse failed, using raw transcription");
                  allChunks.push(`Q: What did the manager say?\nA: ${transcription}`);
                  knowledgeSummary.audioNotes++;
                }
              }
            } else {
              const errText = await whisperRes.text();
              console.error("[Onboarding] Whisper error:", errText);
            }
          } catch (audioErr) {
            console.error("[Onboarding] Audio processing error:", audioErr);
          }
        } else {
          console.log("[Onboarding] Skipping audio - too short or no API key");
        }
      }
    } else {
      console.log("[Onboarding] No audio recordings in request");
    }
    
    knowledgeSummary.total = allChunks.length;
    console.log("[Onboarding] Total chunks:", allChunks.length);
    
    // Save to blob
    if (allChunks.length > 0) {
      const seedDoc = {
        id: `seed-${companyId}-${Date.now()}`,
        name: "Onboarding Knowledge",
        chunks: allChunks,
        uploadedAt: new Date().toISOString(),
        classification: { type: "policy", title: "Onboarding Q&A", confidence: 1 }
      };
      
      const docsKey = `documents-${companyId}.json`;
      let existingDocs: any[] = [];
      try {
        const { blobs } = await list({ prefix: docsKey });
        if (blobs.length > 0) {
          const response = await fetch(blobs[0].url);
          existingDocs = await response.json();
          for (const blob of blobs) await del(blob.url);
        }
      } catch (e) {}
      
      existingDocs.push(seedDoc);
      await put(docsKey, JSON.stringify(existingDocs), { access: "public", addRandomSuffix: false });
      console.log("[Onboarding] Saved to blob");
    }

    const twilioNumber = process.env.TWILIO_PHONE_NUMBER || "+1 (XXX) XXX-XXXX";
    console.log("[Onboarding] DONE - returning success");

    return NextResponse.json({ 
      success: true, 
      companyId,
      locationId,
      companyName: data.companyName,
      location: { city, state },
      knowledgeSummary,
      twilioNumber,
      joinCommand: `JOIN ${data.companyName} ${city}`,
      company: newCompany,
    });

  } catch (error) {
    console.error("[Onboarding] Error:", error);
    return NextResponse.json({ 
      error: "Failed to save onboarding data",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function GET() {
  const companies = await getCompanies();
  return NextResponse.json({ companies });
}
