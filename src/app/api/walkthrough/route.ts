export const runtime = "nodejs";
export const maxDuration = 300;
import { NextRequest, NextResponse } from "next/server";
import { processWalkthroughVideo, generateKnowledgeBase } from "@/lib/video-to-sop";
import { supabase } from "@/lib/supabase";
import { createEmbedding } from "@/lib/embeddings";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import os from "os";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const video = formData.get("video") as File;
    const companyId = (formData.get("companyId") as string) || "default";

    if (!video) {
      return NextResponse.json({ error: "No video provided" }, { status: 400 });
    }

    // Save video to temp directory
    const videoId = uuidv4();
    const tempDir = path.join(os.tmpdir(), `walkthrough-${videoId}`);
    await mkdir(tempDir, { recursive: true });

    const videoPath = path.join(tempDir, "input.mp4");
    const bytes = await video.arrayBuffer();
    await writeFile(videoPath, Buffer.from(bytes));

    // Process video
    const { segments, framePaths } = await processWalkthroughVideo(videoPath, tempDir);
    const result = generateKnowledgeBase(segments);

    // Upload frames to Supabase Storage and update URLs
    for (const loc of result.locations) {
      for (let i = 0; i < loc.frameUrls.length; i++) {
        const localPath = loc.frameUrls[i];
        if (localPath) {
          try {
            const frameData = await readFile(localPath);
            const storagePath = `walkthroughs/${companyId}/${videoId}/${path.basename(localPath)}`;

            const { error: uploadError } = await supabase.storage
              .from("frames")
              .upload(storagePath, frameData, { contentType: "image/jpeg" });

            if (!uploadError) {
              const { data } = supabase.storage.from("frames").getPublicUrl(storagePath);
              loc.frameUrls[i] = data.publicUrl;
            }
          } catch (e) {
            console.error("Frame upload failed:", e);
          }
        }
      }
    }

    // Update FAQ and chunk frame URLs
    for (const faq of result.faqs) {
      const loc = result.locations.find((l) => l.name === faq.location);
      if (loc && loc.frameUrls[0]) {
        faq.frameUrl = loc.frameUrls[0];
      }
    }
    for (const chunk of result.chunks) {
      const loc = result.locations.find((l) => l.name === chunk.metadata.location);
      if (loc && loc.frameUrls[0]) {
        chunk.metadata.frameUrl = loc.frameUrls[0];
      }
    }

    // Store document entry
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .insert({
        company_id: companyId,
        name: `Walkthrough - ${new Date().toLocaleDateString()}`,
        content: result.chunks.map((c) => c.content).join("\n\n---\n\n"),
        metadata: { type: "walkthrough", videoId, locations: result.locations.length },
      })
      .select()
      .single();

    if (docError) {
      console.error("Document insert error:", docError);
      throw docError;
    }

    // Store chunks with embeddings
    for (const chunk of result.chunks) {
      try {
        const embedding = await createEmbedding(chunk.content);
        await supabase.from("document_chunks").insert({
          document_id: doc.id,
          company_id: companyId,
          content: chunk.content,
          embedding,
          metadata: chunk.metadata,
        });
      } catch (e) {
        console.error("Chunk insert error:", e);
      }
    }

    // Store FAQs (if you have an faqs table, otherwise skip)
    // for (const faq of result.faqs) {
    //   await supabase.from("faqs").insert({
    //     company_id: companyId,
    //     question: faq.question,
    //     answer: faq.answer,
    //     metadata: { location: faq.location, frame_url: faq.frameUrl },
    //   });
    // }

    return NextResponse.json({
      success: true,
      videoId,
      documentId: doc.id,
      locations: result.locations.length,
      faqs: result.faqs.length,
      chunks: result.chunks.length,
    });
  } catch (error) {
    console.error("Walkthrough processing error:", error);
    return NextResponse.json(
      { error: "Processing failed", details: String(error) },
      { status: 500 }
    );
  }
}
