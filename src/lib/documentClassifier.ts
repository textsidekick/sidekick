import Anthropic from "@anthropic-ai/sdk";
import fs from "fs";
import path from "path";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || 'placeholder',
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
  | "repair_order"
  | "vehicle_inventory"
  | "supplier_invoice"
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

// PHASE 1: Classify document type
export async function classifyDocument(textContent: string): Promise<{
  type: DocumentType;
  title: string;
  confidence: number;
}> {
  const sample = textContent.slice(0, 2000);

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5",
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
- repair_order: Vehicle/equipment repair orders, service records
- vehicle_inventory: Vehicle stock lists, dealership inventory
- supplier_invoice: Invoices from suppliers, payment records
- other: Anything that doesn't fit above categories

Return ONLY a JSON object with this exact format (no markdown, no explanation):
{
  "type": "shift_schedule",
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

// PHASE 2: Extract structured data based on document type
export async function extractStructuredData(
  textContent: string, 
  docType: DocumentType
): Promise<any> {
  const extractionPrompts: Record<DocumentType, string> = {
    shift_schedule: `Extract ALL shift information as a JSON array:
{
  "shifts": [
    {
      "employeeName": "John Doe",
      "date": "2025-01-15",
      "startTime": "08:00",
      "endTime": "16:00",
      "location": "Building A",
      "role": "Forklift Operator"
    }
  ]
}`,
    
    commission_sheet: `Extract commission structure as JSON:
{
  "commissions": [
    {
      "employeeName": "Jane Smith",
      "salesAmount": 50000,
      "commissionRate": 0.05,
      "commissionAmount": 2500,
      "period": "December 2024"
    }
  ]
}`,
    
    safety_manual: `Extract safety requirements as JSON:
{
  "requirements": [
    {
      "area": "Factory Floor",
      "ppe": ["Hard hat", "Steel-toed boots", "Safety glasses"],
      "procedures": ["Clock in before entering", "Report all accidents"],
      "emergencyContacts": ["Supervisor: 555-0100"]
    }
  ]
}`,
    
    repair_order: `Extract repair order details as JSON:
{
  "orders": [
    {
      "vehicleId": "VIN123456",
      "customerName": "ABC Corp",
      "issueDescription": "Oil change needed",
      "partsNeeded": ["Oil filter", "5qt oil"],
      "laborHours": 1.5,
      "totalCost": 75.00
    }
  ]
}`,
    
    vehicle_inventory: `Extract vehicle inventory as JSON:
{
  "vehicles": [
    {
      "vin": "1HGBH41JXMN109186",
      "make": "Honda",
      "model": "Accord",
      "year": 2024,
      "color": "Blue",
      "price": 28500,
      "status": "In Stock"
    }
  ]
}`,
    
    supplier_invoice: `Extract invoice details as JSON:
{
  "invoices": [
    {
      "invoiceNumber": "INV-2024-001",
      "supplier": "ABC Supplies",
      "date": "2024-12-15",
      "items": [{"name": "Widget", "quantity": 100, "price": 10.50}],
      "total": 1050.00,
      "dueDate": "2025-01-15"
    }
  ]
}`,

    handbook: `Extract key policies as JSON:
{
  "policies": [
    {
      "category": "Parking",
      "rule": "Employees park in Lot B",
      "details": "Behind the building, visitor parking in front"
    }
  ]
}`,
    
    // Default for other types
    payroll_info: `Extract payroll information as JSON with any relevant pay schedules, rates, or policies.`,
    training_material: `Extract training topics, requirements, and completion criteria as JSON.`,
    equipment_manual: `Extract equipment names, operation procedures, and maintenance schedules as JSON.`,
    emergency_procedures: `Extract emergency contacts, procedures, and evacuation routes as JSON.`,
    inventory_manifest: `Extract product names, quantities, locations, and SKUs as JSON.`,
    other: `Extract any structured information present in the document as JSON.`
  };

  const prompt = extractionPrompts[docType] || extractionPrompts.other;

  try {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 2000,
      system: `You are a data extraction expert. Extract structured data from documents.
Return ONLY valid JSON (no markdown, no explanation).
If no relevant data is found, return an empty object: {}`,
      messages: [{
        role: "user",
        content: `${prompt}\n\nDocument content:\n${textContent.slice(0, 4000)}`
      }]
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "{}";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Extraction error:", e);
    return {};
  }
}

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
