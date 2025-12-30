import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";

export async function POST() {
  const handbookId = nanoid();

  await kv.set(\`handbook:\${handbookId}\`, {
    status: "awaiting_upload",
    createdAt: Date.now(),
  });

  return NextResponse.json({
    handbookId,
    pathname: \`handbooks/\${handbookId}.pdf\`,
  });
}
