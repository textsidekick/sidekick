import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

export async function POST(request: NextRequest) {
  try {
    const { companyId } = await request.json();
    if (!companyId) {
      return NextResponse.json({ error: "companyId required" }, { status: 400 });
    }

    let created = 0;
    for (const doc of SAMPLE_DOCS) {
      const { error } = await supabase.from("documents").insert({
        company_id: companyId,
        filename: doc.filename,
        type: doc.type,
        content: doc.content,
        source: "demo",
        created_at: new Date().toISOString(),
      });
      if (!error) created++;
    }

    return NextResponse.json({ success: true, documentsCreated: created });
  } catch (error) {
    console.error("[Demo Seed] Error:", error);
    return NextResponse.json({ error: "Failed to seed demo data" }, { status: 500 });
  }
}
