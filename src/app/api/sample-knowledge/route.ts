import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const SAMPLE_KNOWLEDGE = [
  "General Company Policies:\n- Work hours: Check with your manager for your shift schedule\n- Breaks: Two 15-minute breaks and one 30-minute lunch per 8-hour shift\n- PTO: Submit requests through your manager at least 2 weeks in advance\n- Sick days: Notify your manager before your shift starts\n- Dress code: Follow your department's dress code requirements\n- Parking: Employee parking in designated areas only",
  
  "Safety Guidelines:\n- Always wear required PPE for your work area\n- Report all injuries immediately to your supervisor\n- Know your emergency exits and assembly points\n- Fire extinguishers are located at every column/exit\n- First aid kits are at every exit door\n- For emergencies call 911 then notify your supervisor\n- Report near-misses using the safety report form\n- Never operate equipment you haven't been trained on",

  "New Employee FAQ:\n- Q: Where do I park? A: Employee parking in the designated lot\n- Q: What's the Wi-Fi? A: Ask your manager for network access\n- Q: Where are the bathrooms? A: Follow signs in your building\n- Q: How do I request time off? A: Through your manager, 2 weeks notice\n- Q: Who do I talk to about HR issues? A: Contact your manager or HR department\n- Q: Where do I eat lunch? A: Break room or designated lunch area\n- Q: What if I'm running late? A: Call or text your supervisor before your shift",
];

export async function POST(request: NextRequest) {
  try {
    const { companyId } = await request.json();
    if (!companyId) return NextResponse.json({ error: "Company ID required" }, { status: 400 });

    for (const content of SAMPLE_KNOWLEDGE) {
      await supabase.from("document_chunks").insert({
        company_id: companyId,
        content,
        metadata: { source: "sample", type: "starter-kit" },
      });
    }

    return NextResponse.json({ success: true, chunksAdded: SAMPLE_KNOWLEDGE.length });
  } catch (error) {
    return NextResponse.json({ error: "Failed to load sample knowledge" }, { status: 500 });
  }
}
