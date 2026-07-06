import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";

const SAMPLE_DOCS = [
  {
    filename: "Employee Handbook 2024.pdf",
    type: "handbook",
    content: `Employee Handbook 2024

## Paid Time Off (PTO)
All full-time employees receive 15 days of PTO per year, accrued monthly. PTO requests must be submitted at least 2 weeks in advance through your supervisor. Unused PTO rolls over up to 5 days.

## Dress Code
- Warehouse staff: Steel-toed boots required. Hi-vis vest provided. No loose clothing near machinery.
- Office staff: Business casual Monday-Thursday, casual Friday.
- All staff: Closed-toe shoes required in all facility areas.

## Attendance Policy
Shifts start promptly at scheduled time. Clock in using the timeclock at the main entrance. More than 3 unexcused absences in 90 days may result in disciplinary action. If you will be late or absent, notify your supervisor at least 1 hour before shift start.

## Break Policy
- 8-hour shifts: One 30-minute unpaid lunch break and two 15-minute paid breaks.
- Breaks must be taken in the designated break room or outdoor break area.

## Benefits
- Health insurance (medical, dental, vision) after 60 days of employment
- 401(k) with 3% company match after 1 year
- Employee discount program
- Annual performance bonus eligibility`,
  },
  {
    filename: "Safety Procedures Manual.pdf",
    type: "safety",
    content: `Safety Procedures Manual

## Personal Protective Equipment (PPE)
- Hard hats required in all warehouse zones
- Steel-toed boots mandatory for all floor staff
- Safety glasses required when operating machinery
- Hearing protection required in Zone C (noise level >85dB)
- Hi-vis vests must be worn at all times in loading dock area

## Emergency Procedures
1. Fire: Pull nearest fire alarm. Evacuate via marked exits. Assembly point: front parking lot.
2. Injury: Report immediately to shift supervisor. First aid kits located at stations A1, B3, C2.
3. Chemical spill: Evacuate area. Do NOT attempt cleanup. Call safety hotline: ext. 911.
4. Severe weather: Move to interior rooms away from windows. Listen for PA announcements.

## Forklift Safety
- Only certified operators may operate forklifts
- Maximum speed: 5 mph in warehouse, 3 mph near pedestrians
- Honk at all intersections and blind corners
- Never exceed rated load capacity
- Report any mechanical issues immediately

## Incident Reporting
All incidents, near-misses, and unsafe conditions must be reported within 24 hours using the safety report form available from your supervisor or the safety board in the break room.`,
  },
  {
    filename: "New Hire Orientation Guide.pdf",
    type: "onboarding",
    content: `New Hire Orientation Guide

## Day 1
1. Report to main office at 8:00 AM
2. Complete paperwork with HR (bring ID and Social Security card)
3. Receive badge, uniform, and PPE
4. Facility tour with your assigned buddy
5. Safety orientation video (45 min)
6. Meet your supervisor and team
7. Review shift schedule

## First Week
- Shadow your assigned buddy for all tasks
- Complete online training modules (accessible from break room computer)
- Learn emergency exits and assembly points
- Get familiar with break room, restrooms, and parking areas

## First Month
- Complete all required certifications
- Meet with supervisor for 30-day check-in
- Begin independent task assignments
- Set up direct deposit if not done during orientation

## Key Contacts
- HR Office: ext. 200 (Mon-Fri 8am-5pm)
- Safety Manager: ext. 150
- IT Help Desk: ext. 300
- Employee Assistance Program: 1-800-555-0199 (24/7)`,
  },
  {
    filename: "Shift Schedule Template.xlsx",
    type: "schedule",
    content: `Shift Schedules

## Morning Shift (A Shift)
- Hours: 6:00 AM - 2:30 PM
- Lunch: 11:00 AM - 11:30 AM
- Break 1: 8:30 AM | Break 2: 1:00 PM

## Afternoon Shift (B Shift)
- Hours: 2:00 PM - 10:30 PM
- Lunch: 6:00 PM - 6:30 PM
- Break 1: 4:00 PM | Break 2: 8:30 PM

## Night Shift (C Shift)
- Hours: 10:00 PM - 6:30 AM
- Lunch: 2:00 AM - 2:30 AM
- Break 1: 12:00 AM | Break 2: 4:30 AM

## Overtime
Overtime is available on a voluntary basis. Mandatory overtime may be required during peak season (Nov-Dec). Overtime pay is 1.5x regular rate.

## Shift Swaps
Shift swaps must be approved by your supervisor at least 48 hours in advance. Both employees must agree to the swap.`,
  },
  {
    filename: "FAQ - Common Questions.pdf",
    type: "faq",
    content: `Frequently Asked Questions

Q: How do I request time off?
A: Submit a PTO request to your supervisor at least 2 weeks in advance. You can use the paper form from the break room board or email your supervisor directly.

Q: Where do I park?
A: Employee parking is in Lot B (behind the building). Display your employee parking pass on your dashboard. Lot A is for visitors only.

Q: What do I do if I'm running late?
A: Call or text your supervisor at least 1 hour before your shift starts. The supervisor contact list is posted on the break room board.

Q: How do I get my pay stub?
A: Pay stubs are available through the ADP portal. Ask HR (ext. 200) for your login credentials if you haven't set up your account.

Q: Can I eat at my workstation?
A: No. Food and drinks (except water in a sealed container) must stay in the break room for safety and cleanliness reasons.

Q: What if I see something unsafe?
A: Report it immediately to your supervisor or the safety manager (ext. 150). You can also submit an anonymous report at the safety board in the break room.

Q: How do I sign up for benefits?
A: Benefits enrollment opens after 60 days of employment. HR will contact you with enrollment instructions. Open enrollment for changes is every November.

Q: Is there a gym or fitness benefit?
A: Yes, employees get a discounted membership at FitZone gym ($15/month vs $40/month). See HR for the enrollment form.`,
  },
];

const SAMPLE_PROCEDURES = [
  {
    title: "Reset filler line after cap sensor fault",
    problem: "The filler line stops mid-run when the cap presence sensor loses alignment and begins throwing repeated fault codes.",
    symptoms: "HMI shows cap sensor fault, conveyor pauses after 2-3 bottles, and operators report intermittent restarts before the line trips again.",
    solution: "1. Stop the line from the local HMI. 2. Clear any jammed caps in the infeed chute. 3. Clean the cap sensor lens with a dry lint-free wipe. 4. Loosen the mounting bracket slightly and realign the sensor to the reflector until the indicator stays solid. 5. Tighten bracket, clear the HMI fault, and run 10 empty bottles to confirm stable detection before resuming production.",
    equipment_type: "Filler line",
    asset_name: "Line 2 Bottle Filler",
    parts_used: ["Lint-free wipe"],
    time_estimate_minutes: 12,
    times_referenced: 18,
    tags: ["filler", "sensor", "caps", "line-reset"],
  },
  {
    title: "Clear carton erector vacuum loss on startup",
    problem: "The carton erector fails to pick blanks consistently at startup because the vacuum cups lose suction after idle periods.",
    symptoms: "Cartons fail to open, suction alarm appears, and operators hear the vacuum pump cycling rapidly during the first few minutes of startup.",
    solution: "1. Verify air supply is above operating minimum. 2. Inspect and reseat the vacuum lines at the cup manifold. 3. Wipe dust from cups and replace any cup with visible cracking. 4. Confirm the vacuum regulator is set to standard startup pressure. 5. Cycle the erector in manual mode for 5 cartons before switching back to auto.",
    equipment_type: "Packaging",
    asset_name: "Carton Erector 1",
    parts_used: ["30 mm vacuum cup"],
    time_estimate_minutes: 15,
    times_referenced: 11,
    tags: ["packaging", "vacuum", "startup", "cartons"],
  },
  {
    title: "Recover palletizer after downstream photo-eye blockage",
    problem: "The palletizer stops feeding layers when the downstream photo-eye is blocked by stretch-wrap tails or skewed cases.",
    symptoms: "Downstream blocked alarm, layer build stalls, and the discharge conveyor remains occupied even after operators clear the lane visually.",
    solution: "1. Lock out conveyor motion from the local station. 2. Remove any wrap tails or skewed cases blocking the photo-eye. 3. Wipe the lens and reflector. 4. Check the bracket position and confirm the beam clears the conveyor guard. 5. Restore power, reset the alarm, and jog one layer through before returning to automatic mode.",
    equipment_type: "Palletizer",
    asset_name: "End-of-Line Palletizer",
    parts_used: ["Lint-free wipe"],
    time_estimate_minutes: 10,
    times_referenced: 14,
    tags: ["palletizer", "photo-eye", "conveyor", "reset"],
  },
  {
    title: "Restart air compressor after high temperature shutdown",
    problem: "The backup air compressor shuts down during heavy load when the cooler fins clog and head temperature exceeds the shutdown threshold.",
    symptoms: "High temperature shutdown on compressor panel, reduced plant air pressure, and maintenance reports visible dust buildup on the cooler intake.",
    solution: "1. Isolate and lock out the compressor. 2. Blow out cooler fins from the clean side using low-pressure air. 3. Confirm the cooling fan spins freely and intake screen is clear. 4. Let the unit sit for 10 minutes, then restore power. 5. Restart unloaded and watch temperature for 5 minutes before returning it to service.",
    equipment_type: "Utilities",
    asset_name: "Backup Air Compressor",
    parts_used: ["Compressed air hose"],
    time_estimate_minutes: 20,
    times_referenced: 7,
    tags: ["compressor", "temperature", "utilities", "shutdown"],
  },
];

export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    let documentsCreated = 0;
    for (const doc of SAMPLE_DOCS) {
      const { data: existing } = await supabase
        .from("documents")
        .select("id")
        .eq("company_id", companyId)
        .eq("filename", doc.filename)
        .limit(1);

      if (existing && existing.length > 0) continue;

      const { error } = await supabase.from("documents").insert({
        company_id: companyId,
        filename: doc.filename,
        type: doc.type,
        content: doc.content,
        source: "demo",
        created_at: new Date().toISOString(),
      });
      if (!error) documentsCreated++;
    }

    let proceduresCreated = 0;
    for (const procedure of SAMPLE_PROCEDURES) {
      const { data: existing } = await supabase
        .from("knowledge_articles")
        .select("id")
        .eq("company_id", companyId)
        .eq("title", procedure.title)
        .limit(1);

      if (existing && existing.length > 0) continue;

      const { error } = await supabase.from("knowledge_articles").insert({
        company_id: companyId,
        asset_id: null,
        asset_name: procedure.asset_name,
        equipment_type: procedure.equipment_type,
        title: procedure.title,
        problem: procedure.problem,
        symptoms: procedure.symptoms,
        solution: procedure.solution,
        parts_used: procedure.parts_used,
        time_estimate_minutes: procedure.time_estimate_minutes,
        tags: procedure.tags,
        times_referenced: procedure.times_referenced,
        source_work_order_id: null,
      });

      if (!error) proceduresCreated++;
    }

    return NextResponse.json({ success: true, documentsCreated, proceduresCreated });
  } catch (error) {
    console.error("[Demo Seed] Error:", error);
    return NextResponse.json({ error: "Failed to seed demo data" }, { status: 500 });
  }
}
