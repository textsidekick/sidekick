import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audio = formData.get("audio") as Blob;

    if (!audio) {
      return NextResponse.json({ error: "No audio provided" }, { status: 400 });
    }

    const apiKey = process.env.DEEPGRAM_API_KEY;
    if (!apiKey || apiKey === "placeholder") {
      return NextResponse.json(
        { error: "Transcription service not configured" },
        { status: 500 }
      );
    }

    // Send to Deepgram for transcription
    const buffer = Buffer.from(await audio.arrayBuffer());

    const response = await fetch(
      "https://api.deepgram.com/v1/listen?model=nova-2&smart_format=true",
      {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey}`,
          "Content-Type": audio.type || "audio/webm",
        },
        body: buffer,
      }
    );

    if (!response.ok) {
      console.error("[Transcribe] Deepgram error:", response.status);
      return NextResponse.json(
        { error: "Transcription failed" },
        { status: 500 }
      );
    }

    const result = await response.json();
    const text =
      result.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";

    return NextResponse.json({ text });
  } catch (error) {
    console.error("[Transcribe] Error:", error);
    return NextResponse.json(
      { error: "Transcription failed" },
      { status: 500 }
    );
  }
}
