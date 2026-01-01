import { NextRequest, NextResponse } from "next/server";
import { getDocuments, addDocument, deleteDocument, updateDocumentEmbeddings } from "./store";
import { getEmbeddings } from "@/lib/embeddings";
import { classifyDocument, extractStructuredData, DocumentType } from "@/lib/documentClassifier";

async function extractPdfText(buffer: Buffer): Promise<string> {
  try {
    const pdfParse = (await import("pdf-parse")).default;
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error("PDF parsing error:", error);
    return "";
  }
}

export async function GET() {
  return NextResponse.json({ documents: getDocuments() });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  let content: string;

  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    content = await extractPdfText(buffer);
    console.log("Extracted PDF text length:", content.length);
  } else {
    content = await file.text();
  }

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: "Could not extract text from file" }, { status: 400 });
  }

  // Improved chunking
  const chunks = content
    .split(/\n\s*\n|\r\n\s*\r\n/)
    .map(chunk => chunk.trim())
    .filter(chunk => chunk.length > 30)
    .map(chunk => chunk.replace(/\s+/g, " "));

  console.log("Created", chunks.length, "chunks from", file.name);

  const doc = {
    id: Date.now().toString(),
    name: file.name,
    type: file.type || "text/plain",
    size: file.size,
    content: content.slice(0, 10000),
    uploadedAt: new Date().toISOString(),
    chunks,
  };

  addDocument(doc);

  // Run classification and embeddings in parallel
  let classification = null;
  let extractedData = null;
  let summary = null;

  // Document Intelligence: Classify and extract
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      console.log("Classifying document:", file.name);
      classification = await classifyDocument(content);
      console.log("Classification:", classification);

      // Extract structured data based on type
      extractedData = await extractStructuredData(content, classification.type);
      console.log("Extracted data:", JSON.stringify(extractedData).slice(0, 200));

      // Generate summary
      summary = formatSummary(classification, extractedData);
    } catch (err) {
      console.error("Classification error:", err);
    }
  }

  // Generate embeddings in background
  if (process.env.OPENAI_API_KEY && chunks.length > 0) {
    getEmbeddings(chunks)
      .then(embeddings => {
        updateDocumentEmbeddings(doc.id, embeddings);
        console.log("Generated", embeddings.length, "embeddings for", file.name);
      })
      .catch(err => console.error("Embedding error:", err));
  }

  return NextResponse.json({
    success: true,
    document: doc,
    chunksCount: chunks.length,
    classification,
    extractedData,
    summary,
  });
}

function formatSummary(classification: { type: DocumentType; title: string; confidence: number }, extractedData: any): string {
  const typeLabels: Record<string, string> = {
    handbook: "📘 Employee Handbook",
    safety_manual: "🦺 Safety Manual",
    shift_schedule: "📅 Shift Schedule",
    payroll_info: "💰 Payroll Info",
    training_material: "🎓 Training Material",
    equipment_manual: "⚙️ Equipment Manual",
    emergency_procedures: "🚨 Emergency Procedures",
    inventory_manifest: "📦 Inventory",
    commission_sheet: "💵 Commission Sheet",
    repair_order: "🔧 Repair Order",
    vehicle_inventory: "🚗 Vehicle Inventory",
    supplier_invoice: "🧾 Supplier Invoice",
    other: "📄 Document",
  };

  const lines: string[] = [];
  lines.push(`**${typeLabels[classification.type] || "Document"}**: ${classification.title}`);
  lines.push(`*Confidence: ${Math.round(classification.confidence * 100)}%*`);
  lines.push("");

  // Add extracted data summary
  if (extractedData) {
    if (extractedData.policies?.length) {
      lines.push("**Key Policies:**");
      extractedData.policies.slice(0, 3).forEach((p: any) => {
        lines.push(`• ${p.category}: ${p.rule}`);
      });
    }
    if (extractedData.requirements?.length) {
      const req = extractedData.requirements[0];
      if (req.ppe?.length) {
        lines.push(`**PPE Required:** ${req.ppe.join(", ")}`);
      }
    }
    if (extractedData.shifts?.length) {
      lines.push(`**Shifts Found:** ${extractedData.shifts.length} shift entries`);
    }
    if (extractedData.vehicles?.length) {
      lines.push(`**Vehicles:** ${extractedData.vehicles.length} in inventory`);
    }
  }

  return lines.join("\n");
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "No ID provided" }, { status: 400 });
  }

  deleteDocument(id);
  return NextResponse.json({ success: true });
}
