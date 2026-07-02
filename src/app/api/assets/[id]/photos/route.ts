import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: assetId } = await params;
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const limit = Math.min(50, Math.max(1, Number(url.searchParams.get("limit") || "20")));
  const offset = (page - 1) * limit;

  const { data, error, count } = await supabase
    .from("asset_photos")
    .select("*", { count: "exact" })
    .eq("asset_id", assetId)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    photos: data || [],
    total: count || 0,
    page,
    limit,
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: assetId } = await params;
  const body = await request.json();

  const { photo_url, issue_description, company_id, reported_by_phone } = body;

  if (!photo_url || !company_id) {
    return NextResponse.json(
      { error: "photo_url and company_id are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("asset_photos")
    .insert({
      asset_id: assetId,
      company_id,
      photo_url,
      issue_description: issue_description || null,
      reported_by_phone: reported_by_phone || null,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ photo: data }, { status: 201 });
}
