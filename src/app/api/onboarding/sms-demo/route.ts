import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message:
      "Demo mode - this is a sample answer from our demo manufacturing company. Ready to set up your own? Text SETUP to your company's number.",
    company: {
      name: "Acme Manufacturing",
      industry: "Manufacturing",
      worker_count: 50,
      assets: [
        { name: "CNC Mill #1", type: "CNC Mill", location: "Bay A" },
        { name: "Hydraulic Press #2", type: "Press", location: "Bay B" },
        { name: "Conveyor Belt Main", type: "Conveyor", location: "Line 1" },
      ],
    },
  });
}
