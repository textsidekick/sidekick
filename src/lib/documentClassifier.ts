import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export type DocumentType = 
  | "handbook" 
  | "safety_manual" 
  | "shift_schedule" 
  | "payroll_info" 
  | "training_material" 
  | "equipment_manual" 
  | "emergency_procedures"
  | "inventory_manifest"
  | "commission_sheet"
  | "other";

export interface DocumentMetadata {
  id: string;
  companyId: string;
  filename: string;
  type: DocumentType;
  title: string;
  uploadedAt: number;
  extractedData?: any;
  pageCount?: number;
}

export async function classifyDocument(textContent: string): Promise<{
  type: DocumentType;
  title: string;
  confidence: number;
}> {
  const sample = textContent.slice(0, 2000);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 500,
    system: `You are a document classification expert for workplace documents. 
Analyze the document content and classify it into ONE of these types:
- handbook: Employee handbooks, company policies, general onboarding materials
- safety_manual: Safety procedures, PPE requirements, hazard information
- shift_schedule: Work schedules, shift assignments, time schedules
- payroll_info: Pay schedules, commission structures, compensation info
- training_material: Training guides, instructional materials, how-to documents
- equipment_manual: Equipment operation, maintenance procedures
- emergency_procedures: Emergency contacts, evacuation plans, crisis procedures
- inventory_manifest: Product lists, inventory tracking, stock information
- commission_sheet: Sales commissions, bonus structures
- other: Anything that doesn't fit above categories

Return ONLY a JSON object with this exact format (no markdown, no explanation):
{
  "type": "handbook",
  "title": "Brief descriptive title (max 50 chars)",
  "confidence": 0.95
}`,
    messages: [{
      role: "user",
      content: `Classify this document:\n\n${sample}`
    }]
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";
  
  try {
    const result = JSON.parse(text.trim());
    return {
      type: result.type || "other",
      title: result.title || "Untitled Document",
      confidence: result.confidence || 0.5
    };
  } catch {
    return {
      type: "other",
      title: "Untitled Document",
      confidence: 0.3
    };
  }
}

// Store in /tmp for Vercel (ephemeral, but works for demo)
const STORAGE_DIR = "/tmp/sidekick-documents";

export function saveDocumentMetadata(companyId: string, metadata: DocumentMetadata) {
  const metaDir = path.join(STORAGE_DIR, companyId);
  if (!fs.existsSync(metaDir)) {
    fs.mkdirSync(metaDir, { recursive: true });
  }
  
  const metaFile = path.join(metaDir, "metadata.json");
  let allMeta: DocumentMetadata[] = [];
  
  if (fs.existsSync(metaFile)) {
    allMeta = JSON.parse(fs.readFileSync(metaFile, "utf-8"));
  }
  
  allMeta.push(metadata);
  fs.writeFileSync(metaFile, JSON.stringify(allMeta, null, 2));
}

export function getDocumentsByCompany(companyId: string): DocumentMetadata[] {
  const metaFile = path.join(STORAGE_DIR, companyId, "metadata.json");
  if (!fs.existsSync(metaFile)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(metaFile, "utf-8"));
}

export function getDocumentText(companyId: string, documentId: string): string {
  const docFile = path.join(STORAGE_DIR, companyId, `${documentId}.txt`);
  if (!fs.existsSync(docFile)) {
    return "";
  }
  return fs.readFileSync(docFile, "utf-8");
}
