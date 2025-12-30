import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

export async function POST(req: Request) {
  try {
    // v1.1.1 works cleanly in Node; require inside handler to avoid module side effects
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfParse = require("pdf-parse");

    const form = await req.formData();
    const file = form.get("file");
    const companyId = String(form.get("companyId") ?? "demo");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Missing PDF file" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const parsed = await pdfParse(buf);

    const text = String(parsed?.text ?? "").replace(/\u0000/g, "").trim();
    if (text.length < 50) {
      return NextResponse.json(
        { error: "Could not extract enough text from that PDF." },
        { status: 400 }
      );
    }

    const dataDir = path.join(process.cwd(), "data", "handbooks");
    ensureDir(dataDir);

    const outPath = path.join(dataDir, `${companyId}.txt`);
    fs.writeFileSync(outPath, text, "utf-8");

    return NextResponse.json({ ok: true, companyId, chars: text.length, savedTo: outPath });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Upload failed", detail: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
