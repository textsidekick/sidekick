import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { execSync } from "child_process";
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
  // Create output directories
  fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(path.join(outputDir, "frames"), { recursive: true });

  // Extract audio
  const audioPath = path.join(outputDir, "audio.wav");
  execSync(
    `ffmpeg -y -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}"`,
    { stdio: "pipe" }
  );

  // Get video duration
  const durationOutput = execSync(
    `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoPath}"`,
    { encoding: "utf-8" }
  );
  const duration = parseFloat(durationOutput.trim());

  // Extract frames every 5 seconds
  const frameTimes: number[] = [];
  for (let t = 0; t < duration; t += 5) {
    frameTimes.push(t);
  }

  const framePaths = new Map<number, string>();
  for (const t of frameTimes) {
    const framePath = path.join(outputDir, "frames", `frame_${t.toString().padStart(3, "0")}.jpg`);
    try {
      execSync(
        `ffmpeg -y -ss ${t} -i "${videoPath}" -vframes 1 -q:v 2 "${framePath}"`,
        { stdio: "pipe" }
      );
      if (fs.existsSync(framePath)) {
        framePaths.set(t, framePath);
      }
    } catch (e) {
      console.error(`Failed to extract frame at ${t}s`);
    }
  }

  // Transcribe with Whisper
  const audioFile = fs.createReadStream(audioPath);
  const transcription = await openai.audio.transcriptions.create({
    model: "whisper-1",
    file: audioFile,
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  });

  // Analyze frames and match to transcript
  const segments: WalkthroughSegment[] = [];

  for (const seg of (transcription as any).segments || []) {
    const midTime = (seg.start + seg.end) / 2;
    const closestTime = frameTimes.reduce((prev, curr) =>
      Math.abs(curr - midTime) < Math.abs(prev - midTime) ? curr : prev
    );
    const framePath = framePaths.get(closestTime);

    let analysis = { location: "General Area", items: [] as string[] };

    if (framePath) {
      try {
        const imageData = fs.readFileSync(framePath).toString("base64");

        const response = await anthropic.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 500,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: { type: "base64", media_type: "image/jpeg", data: imageData },
                },
                {
                  type: "text",
                  text: `Analyze this frame from a facility walkthrough. Return JSON only:
{"location": "short area name", "items": ["item1", "item2"]}
JSON only, no explanation.`,
                },
              ],
            },
          ],
        });

        const content = response.content[0];
        if (content.type === "text") {
          const cleaned = content.text.replace(/```json\n?|\n?```/g, "").trim();
          analysis = JSON.parse(cleaned);
        }
      } catch (e) {
        console.error("Frame analysis failed:", e);
      }
    }

    segments.push({
      start: seg.start,
      end: seg.end,
      text: seg.text,
      framePath,
      location: analysis.location,
      items: analysis.items,
    });
  }

  return { segments, framePaths };
}

export function generateKnowledgeBase(segments: WalkthroughSegment[]): WalkthroughResult {
  // Group by location
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

  // Dedupe items
  for (const loc of locationMap.values()) {
    loc.items = [...new Set(loc.items)];
  }

  const locations = Array.from(locationMap.values());

  // Generate FAQs
  const faqs: WalkthroughResult["faqs"] = [];
  for (const loc of locations) {
    for (const item of loc.items.slice(0, 3)) {
      faqs.push({
        question: `Where is the ${item.toLowerCase()}?`,
        answer: `The ${item.toLowerCase()} is in the ${loc.name}.`,
        location: loc.name,
        frameUrl: loc.frameUrls[0],
      });
    }
    // Add a general location FAQ
    faqs.push({
      question: `What is in the ${loc.name.toLowerCase()}?`,
      answer: `The ${loc.name} contains: ${loc.items.join(", ") || "various equipment"}. ${loc.instructions[0] || ""}`,
      location: loc.name,
      frameUrl: loc.frameUrls[0],
    });
  }

  // Generate chunks for RAG
  const chunks: WalkthroughResult["chunks"] = locations.map((loc) => ({
    content: `Location: ${loc.name}\n\nInstructions: ${loc.instructions.join(" ")}\n\nItems: ${loc.items.join(", ")}`,
    metadata: {
      type: "walkthrough",
      location: loc.name,
      keywords: [loc.name.toLowerCase(), ...loc.items.map((i) => i.toLowerCase())],
      frameUrl: loc.frameUrls[0],
    },
  }));

  return { locations, faqs, chunks };
}
