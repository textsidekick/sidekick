import Anthropic from "@anthropic-ai/sdk";
import { supabase } from "@/lib/supabase";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "placeholder" });

// ============================================
// Vendor / Contractor Escalation
// When an issue exceeds internal capability, automatically
// identify the right vendor, prepare a summary, and send it
// ============================================

export interface VendorContact {
  id: string;
  company_id: string;
  name: string;
  company_name: string;
  phone: string;
  email: string | null;
  specialty: string;    // "electrical", "hydraulic", "cnc_service", "hvac", etc.
  equipment_brands: string[];  // ["HAAS", "Fanuc", "Siemens"]
  notes: string | null;
  created_at: string;
}

export interface EscalationPackage {
  vendor: VendorContact | null;
  summary: string;         // AI-generated summary for vendor
  urgency: string;
  equipmentInfo: string;
  issueHistory: string;
  photosIncluded: number;
  smsMessage: string;      // Ready-to-send SMS to vendor
}

// Find the best vendor for a given issue
export async function findBestVendor(
  companyId: string,
  category: string,
  equipmentType?: string,
  manufacturer?: string
): Promise<VendorContact | null> {
  const { data: vendors } = await supabase
    .from("vendor_contacts")
    .select("*")
    .eq("company_id", companyId);

  if (!vendors || vendors.length === 0) return null;

  // Score each vendor by relevance
  const scored = vendors.map((v: any) => {
    let score = 0;
    // Match by specialty
    if (v.specialty && v.specialty.toLowerCase().includes(category.toLowerCase())) score += 10;
    // Match by equipment brand
    if (manufacturer && v.equipment_brands?.some((b: string) => 
      b.toLowerCase().includes(manufacturer.toLowerCase()) || 
      manufacturer.toLowerCase().includes(b.toLowerCase())
    )) score += 20;
    // Match by equipment type in specialty
    if (equipmentType && v.specialty?.toLowerCase().includes(equipmentType.toLowerCase())) score += 5;
    return { ...v, score };
  });

  scored.sort((a: any, b: any) => b.score - a.score);
  return scored[0]?.score > 0 ? scored[0] : scored[0] || null; // Return best match, or first vendor as fallback
}

// Build an escalation package for a work order
export async function buildEscalationPackage(workOrderId: string): Promise<EscalationPackage> {
  const { data: wo } = await supabase
    .from("work_orders")
    .select("*")
    .eq("id", workOrderId)
    .single();

  if (!wo) throw new Error("Work order not found");

  // Get asset info
  let asset: any = null;
  if (wo.asset_id) {
    const { data: a } = await supabase.from("assets").select("*").eq("id", wo.asset_id).single();
    asset = a;
  }

  // Get recent work order history for this asset
  let recentHistory = "";
  if (wo.asset_id) {
    const { data: history } = await supabase
      .from("work_orders")
      .select("title, category, resolution_notes, created_at")
      .eq("asset_id", wo.asset_id)
      .eq("status", "completed")
      .order("created_at", { ascending: false })
      .limit(5);

    if (history && history.length > 0) {
      recentHistory = history.map((h: any) => 
        `${new Date(h.created_at).toLocaleDateString()}: ${h.title} → ${h.resolution_notes || "resolved"}`
      ).join("\n");
    }
  }

  // Find best vendor
  const vendor = await findBestVendor(
    wo.company_id,
    wo.category || "general",
    asset?.type,
    asset?.manufacturer
  );

  // Generate vendor summary using AI
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 400,
    messages: [{
      role: "user",
      content: `Generate a concise service request summary to send to an external vendor/contractor about this equipment issue.

WORK ORDER: ${wo.title}
DESCRIPTION: ${wo.description || wo.original_message || "N/A"}
PRIORITY: ${wo.priority}
CATEGORY: ${wo.category}

EQUIPMENT:
${asset ? `- Name: ${asset.name}\n- Type: ${asset.type || "N/A"}\n- Manufacturer: ${asset.manufacturer || "N/A"}\n- Model: ${asset.model || "N/A"}\n- Serial: ${asset.serial_number || "N/A"}\n- Location: ${asset.location || "N/A"}` : "Unknown equipment"}

TROUBLESHOOTING ALREADY DONE:
${wo.resolution_notes || "Internal team unable to resolve. Needs external expertise."}

RECENT HISTORY:
${recentHistory || "No recent history"}

Write a professional, concise summary (under 300 words) that gives the vendor everything they need to prepare. Include equipment details, the problem, what's been tried, and urgency.`,
    }],
  });

  const summary = response.content[0].type === "text" ? response.content[0].text : "";

  // Build SMS message (short version for text)
  const urgencyMap: Record<string, string> = {
    critical: "🔴 URGENT",
    high: "🟠 HIGH PRIORITY",
    medium: "🟡 STANDARD",
    low: "🟢 LOW PRIORITY",
  };

  const urgency = urgencyMap[wo.priority] || "STANDARD";
  const equipmentInfo = asset 
    ? `${asset.name} (${asset.manufacturer || ""} ${asset.model || ""})`.trim()
    : "Unknown equipment";

  const smsMessage = `${urgency} — Service Request

Equipment: ${equipmentInfo}
${asset?.serial_number ? `S/N: ${asset.serial_number}` : ""}
Issue: ${wo.title}
${wo.photos?.length ? `📸 ${wo.photos.length} photo(s) available` : ""}

${summary.slice(0, 300)}

Please reply with availability. WO#: ${wo.short_id || wo.id.slice(0, 8)}`.slice(0, 480);

  return {
    vendor,
    summary,
    urgency,
    equipmentInfo,
    issueHistory: recentHistory,
    photosIncluded: wo.photos?.length || 0,
    smsMessage,
  };
}

// Execute the escalation — send to vendor via SMS
export async function executeVendorEscalation(
  workOrderId: string,
  vendorPhone?: string
): Promise<{ success: boolean; vendorName: string; message: string }> {
  const pkg = await buildEscalationPackage(workOrderId);

  const phone = vendorPhone || pkg.vendor?.phone;
  if (!phone) {
    return { success: false, vendorName: "none", message: "No vendor phone number available. Add vendor contacts in settings." };
  }

  try {
    const twilio = require("twilio");
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

    await client.messages.create({
      body: pkg.smsMessage,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    });

    // Update work order with escalation info
    await supabase.from("work_orders").update({
      status: "on_hold",
      resolution_notes: `Escalated to ${pkg.vendor?.company_name || "external vendor"} (${phone}) at ${new Date().toISOString()}.\n\n${pkg.summary}`,
    }).eq("id", workOrderId);

    return {
      success: true,
      vendorName: pkg.vendor?.company_name || pkg.vendor?.name || "vendor",
      message: `Escalated to ${pkg.vendor?.company_name || "vendor"} at ${phone}. WO set to on_hold.`,
    };
  } catch (e: any) {
    return { success: false, vendorName: "", message: `Failed to send: ${e.message}` };
  }
}
