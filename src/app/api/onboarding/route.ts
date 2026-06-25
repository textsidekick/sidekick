import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createEmbedding } from "@/lib/embeddings";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Generate a random 6-character access code
function generateAccessCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Scrape website content
async function scrapeWebsite(url: string): Promise<string[]> {
  const chunks: string[] = [];
  
  try {
    // Normalize URL
    let normalizedUrl = url.trim();
    if (!normalizedUrl.startsWith("http")) {
      normalizedUrl = "https://" + normalizedUrl;
    }
    
    // Fetch the main page
    const response = await fetch(normalizedUrl, {
      headers: { "User-Agent": "Sidekick-Bot/1.0" },
    });
    
    if (!response.ok) {
      console.log("[Onboarding] Failed to fetch website:", response.status);
      return [];
    }
    
    const html = await response.text();
    
    // Extract text content (simple extraction)
    const textContent = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();
    
    // Split into chunks of ~500 chars
    const words = textContent.split(" ");
    let currentChunk = "";
    
    for (const word of words) {
      if ((currentChunk + " " + word).length > 500) {
        if (currentChunk.trim().length > 50) {
          chunks.push("From company website: " + currentChunk.trim());
        }
        currentChunk = word;
      } else {
        currentChunk += " " + word;
      }
    }
    
    if (currentChunk.trim().length > 50) {
      chunks.push("From company website: " + currentChunk.trim());
    }
    
    console.log("[Onboarding] Scraped", chunks.length, "chunks from website");
    
  } catch (error) {
    console.error("[Onboarding] Website scrape error:", error);
  }
  
  return chunks.slice(0, 20); // Limit to 20 chunks
}

export async function POST(request: NextRequest) {
  console.log("[Onboarding] === API HIT ===");
  
  let data: any;
  try {
    data = await request.json();
    console.log("[Onboarding] Company:", data.companyName);
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
    const locationId = companyId + "-" + city.toLowerCase().replace(/\s+/g, "");
    
    // Generate unique access code
    let accessCode = generateAccessCode();
    let attempts = 0;
    while (attempts < 10) {
      const { data: existing } = await supabase
        .from("companies")
        .select("id")
        .eq("access_code", accessCode)
        .single();
      
      if (!existing) break;
      accessCode = generateAccessCode();
      attempts++;
    }
    
    console.log("[Onboarding] Creating company:", companyId, "with access code:", accessCode);
    
    // Upsert company with access code and website
    const { error: companyError } = await supabase
      .from("companies")
      .upsert({ 
        id: companyId, 
        name: data.companyName,
        access_code: accessCode,
        website_url: data.websiteUrl || null,
        manager_name: data.managerName || null,
        manager_phone: data.managerPhone || null,
      }, { onConflict: "id" });
    
    if (companyError) {
      console.error("[Onboarding] Company error:", companyError);
    }
    
    const allChunks: string[] = [];
    const knowledgeSummary = { seedAnswers: 0, documents: 0, audioNotes: 0, websitePages: 0, total: 0 };
    
    // Scrape website if provided
    if (data.websiteUrl) {
      const websiteChunks = await scrapeWebsite(data.websiteUrl);
      allChunks.push(...websiteChunks);
      knowledgeSummary.websitePages = websiteChunks.length;
    }
    
    // Seed answers
    const seedAnswers = data.seedAnswers || {};
    const questionMap: Record<number, string> = { 
      1: "Where should employees park?", 
      2: "Which entrance should workers use?", 
      3: "How do workers clock in?", 
      4: "What PPE is required?", 
      5: "How long are breaks?", 
      6: "What is the phone policy?" 
    };
    
    for (const [id, answer] of Object.entries(seedAnswers)) {
      const question = questionMap[parseInt(id)];
      if (question && answer) {
        const answerText = Array.isArray(answer) ? answer.join(", ") : String(answer);
        allChunks.push("Q: " + question + "\nA: " + answerText);
        knowledgeSummary.seedAnswers++;
      }
    }
    
    if (data.managerName && data.managerPhone) {
      allChunks.push("Q: Who is my manager?\nA: Your manager is " + data.managerName + " at " + data.managerPhone + ".");
      knowledgeSummary.seedAnswers++;
    }
    
    if (data.location) {
      allChunks.push("Q: Where is the workplace located?\nA: " + data.companyName + " is located in " + data.location + ".");
      knowledgeSummary.seedAnswers++;
    }
    
    // Process audio recordings if present
    if (data.audioRecordings && Array.isArray(data.audioRecordings) && data.audioRecordings.length > 0) {
      console.log("[Onboarding] Processing audio recordings:", data.audioRecordings.length);
      
      for (let i = 0; i < data.audioRecordings.length; i++) {
        const recording = data.audioRecordings[i];
        const base64Length = recording.base64?.length || 0;
        
        if (base64Length > 100 && process.env.OPENAI_API_KEY) {
          try {
            const audioBuffer = Buffer.from(recording.base64, "base64");
            const file = new File([audioBuffer], "recording.webm", { type: "audio/webm" });
            const formData = new FormData();
            formData.append("file", file);
            formData.append("model", "whisper-1");
            
            const whisperRes = await fetch("https://api.openai.com/v1/audio/transcriptions", {
              method: "POST",
              headers: { "Authorization": "Bearer " + process.env.OPENAI_API_KEY },
              body: formData,
            });
            
            if (whisperRes.ok) {
              const whisperData = await whisperRes.json();
              const transcription = whisperData.text || "";
              
              if (transcription) {
                const claudeRes = await anthropic.messages.create({
                  model: "claude-sonnet-4-5",
                  max_tokens: 1500,
                  messages: [{ role: "user", content: 'Extract Q&A pairs from this voice note about workplace policies:\n\n"' + transcription + '"\n\nReturn ONLY a JSON array like: [{"question":"...","answer":"..."}]' }]
                });
                
                const claudeText = claudeRes.content[0].type === "text" ? claudeRes.content[0].text : "[]";
                const cleaned = claudeText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
                
                try {
                  const qaPairs = JSON.parse(cleaned);
                  for (const qa of qaPairs) {
                    allChunks.push("Q: " + qa.question + "\nA: " + qa.answer);
                    knowledgeSummary.audioNotes++;
                  }
                } catch (parseErr) {
                  allChunks.push("Q: What did the manager say?\nA: " + transcription);
                  knowledgeSummary.audioNotes++;
                }
              }
            }
          } catch (audioErr) {
            console.error("[Onboarding] Audio processing error:", audioErr);
          }
        }
      }
    }
    
    knowledgeSummary.total = allChunks.length;
    console.log("[Onboarding] Total chunks:", allChunks.length);
    
    // Save chunks to Supabase with embeddings
    if (allChunks.length > 0) {
      const { data: doc, error: docError } = await supabase
        .from("documents")
        .insert({
          company_id: companyId,
          name: "Onboarding Knowledge",
          content: allChunks.join("\n\n"),
        })
        .select()
        .single();
      
      if (docError) {
        console.error("[Onboarding] Doc error:", docError);
      } else if (doc) {
        for (const chunk of allChunks) {
          try {
            const embedding = await createEmbedding(chunk);
            await supabase.from("document_chunks").insert({
              document_id: doc.id,
              company_id: companyId,
              content: chunk,
              embedding: embedding,
            });
          } catch (embErr) {
            console.error("[Onboarding] Embedding error:", embErr);
          }
        }
      }
      console.log("[Onboarding] Saved to Supabase");
    }
    
    const twilioNumber = process.env.TWILIO_PHONE_NUMBER || "+1 (888) 707-4659";
    
    console.log("[Onboarding] DONE - returning success");
    return NextResponse.json({ 
      success: true, 
      companyId,
      locationId,
      companyName: data.companyName,
      location: { city, state },
      knowledgeSummary,
      twilioNumber,
      accessCode,
      joinCommand: "JOIN " + accessCode,
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
  const { data: companies, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ companies: [] });
  }

  return NextResponse.json({ companies });
}
