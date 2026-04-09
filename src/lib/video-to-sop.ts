import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import fs from "fs";
import path from "path";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface WalkthroughSegment {
  start: number;
  end: number;
  text: string;
  framePath?: string;
  location?: string;
  items?: string[];
}

export interface WalkthroughResult {
  locations: {
    name: string;
    instructions: string[];
    items: string[];
    frameUrls: string[];
  }[];
  faqs: {
    question: string;
    answer: string;
    location: string;
    frameUrl?: string;
  }[];
  chunks: {
    content: string;
    metadata: {
      type: string;
      location: string;
      keywords: string[];
      frameUrl?: string;
    };
  }[];
}

export async function processWalkthroughVideo(
  videoPath: string,
  outputDir: string
): Promise<{ segments: WalkthroughSegment[]; framePaths: Map<number, string> }> {
  fs.mkdirSync(outputDir, { recursive: true });

  const videoFile = fs.createReadStream(videoPath);
  
  const transcription = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file: videoFile,
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  });

  const segments: WalkthroughSegment[] = [];
  const framePaths = new Map<number, string>();

  for (const seg of (transcription as any).segments || []) {
    let analysis = { location: "General Area", items: [] as string[] };

    try {
      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: `Analyze this transcript segment from a facility walkthrough video. Based on what's being described, identify the location and any equipment/items mentioned.

Transcript: "${seg.text}"

Return JSON only:
{"location": "short area name based on context", "items": ["item1", "item2"]}
JSON only, no explanation.`,
          },
        ],
      });

      const content = response.content[0];
      if (content.type === "text") {
        const cleaned = content.text.replace(/```json\n?|\n?```/g, "").trim();
        try {
          analysis = JSON.parse(cleaned);
        } catch (e) {
          // Keep default analysis
        }
      }
    } catch (e) {
      console.error("Segment analysis failed:", e);
    }

    segments.push({
      start: seg.start,
      end: seg.end,
      text: seg.text,
      location: analysis.location,
      items: analysis.items,
    });
  }

  return { segments, framePaths };
}

export function generateKnowledgeBase(segments: WalkthroughSegment[]): WalkthroughResult {
  const locationMap = new Map<string, {
    name: string;
    instructions: string[];
    items: string[];
    frameUrls: string[];
  }>();

  for (const seg of segments) {
    const loc = seg.location || "General Area";
    if (!locationMap.has(loc)) {
      locationMap.set(loc, { name: loc, instructions: [], items: [], frameUrls: [] });
    }
    const entry = locationMap.get(loc)!;
    entry.instructions.push(seg.text);
    if (seg.items) entry.items.push(...seg.items);
    if (seg.framePath) entry.frameUrls.push(seg.framePath);
  }

  for (const loc of locationMap.values()) {
    loc.items = [...new Set(loc.items)];
  }

  const locations = Array.from(locationMap.values());

  const faqs: WalkthroughResult["faqs"] = [];
  for (const loc of locations) {
    for (const item of loc.items.slice(0, 3)) {
      faqs.push({
        question: "Where is the " + item.toLowerCase() + "?",
        answer: "The " + item.toLowerCase() + " is in the " + loc.name + ".",
        location: loc.name,
        frameUrl: loc.frameUrls[0],
      });
    }
    faqs.push({
      question: "What is in the " + loc.name.toLowerCase() + "?",
      answer: "The " + loc.name + " contains: " + (loc.items.join(", ") || "various equipment") + ". " + (loc.instructions[0] || ""),
      location: loc.name,
      frameUrl: loc.frameUrls[0],
    });
  }

  const chunks: WalkthroughResult["chunks"] = locations.map((loc) => ({
    content: "Location: " + loc.name + "\n\nInstructions: " + loc.instructions.join(" ") + "\n\nItems: " + loc.items.join(", "),
    metadata: {
      type: "walkthrough",
      location: loc.name,
      keywords: [loc.name.toLowerCase(), ...loc.items.map((i) => i.toLowerCase())],
      frameUrl: loc.frameUrls[0],
    },
  }));

  return { locations, faqs, chunks };
}
