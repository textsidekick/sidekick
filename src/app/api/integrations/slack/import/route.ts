import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { createEmbedding } from "@/lib/embeddings";

export async function POST(request: NextRequest) {
  try {
    const { companyId, channelId, channelName } = await request.json();

    const { data: conn } = await supabase
      .from("slack_connections")
      .select("bot_token")
      .eq("company_id", companyId)
      .single();

    if (!conn?.bot_token) {
      return NextResponse.json({ error: "Slack not connected" }, { status: 400 });
    }

    // Fetch channel history (last 200 messages)
    const historyRes = await fetch(`https://slack.com/api/conversations.history?channel=${channelId}&limit=200`, {
      headers: { "Authorization": `Bearer ${conn.bot_token}` },
    });
    const historyData = await historyRes.json();

    if (!historyData.ok) {
      return NextResponse.json({ error: "Failed to fetch channel history" }, { status: 500 });
    }

    // Combine messages into knowledge chunks
    const messages = (historyData.messages || [])
      .filter((m: any) => m.text && m.text.length > 10 && !m.subtype)
      .map((m: any) => m.text)
      .reverse();

    if (messages.length === 0) {
      return NextResponse.json({ error: "No messages found in channel" }, { status: 400 });
    }

    // Chunk messages into groups of ~10
    const chunks = [];
    for (let i = 0; i < messages.length; i += 10) {
      const chunk = `Slack #${channelName} messages:\n\n` + messages.slice(i, i + 10).join("\n\n");
      chunks.push(chunk);
    }

    for (const chunk of chunks) {
      let embedding = null;
      try { embedding = await createEmbedding(chunk); } catch {}
      
      await supabase.from("document_chunks").insert({
        company_id: companyId,
        content: chunk,
        embedding,
        metadata: { source: "slack", channelId, channelName },
      });
    }

    return NextResponse.json({
      success: true,
      chunksCount: chunks.length,
      messagesImported: messages.length,
      channelName,
    });
  } catch (error) {
    console.error("[Slack] Import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}
