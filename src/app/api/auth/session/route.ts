import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { chooseDefaultLocationId } from "@/lib/company-locations";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("sidekick_session")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Find session
    const { data: session, error } = await supabase
      .from("manager_sessions")
      .select("user_id, company_id, expires_at")
      .eq("token", token)
      .single();

    if (error || !session) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Check expiration
    if (new Date(session.expires_at) < new Date()) {
      // Clean up expired session
      await supabase.from("manager_sessions").delete().eq("token", token);
      return NextResponse.json({ authenticated: false, reason: "expired" }, { status: 401 });
    }

    // Get company info
    const { data: company } = await supabase
      .from("companies")
      .select("id, name, access_code, metadata")
      .eq("id", session.company_id)
      .single();

    const { data: locationRows } = await supabase
      .from("locations")
      .select("id,name,city,state,address,is_primary")
      .eq("company_id", session.company_id)
      .order("is_primary", { ascending: false })
      .order("name", { ascending: true });

    const locations = (locationRows || []).map((location: any) => ({
      id: location.id,
      name: location.name,
      city: location.city || undefined,
      state: location.state || undefined,
      address: location.address || undefined,
      isPrimary: Boolean(location.is_primary),
    }));
    const selectedLocationId = request.nextUrl.searchParams.get("locationId")
      || chooseDefaultLocationId(locations);

    return NextResponse.json({
      authenticated: true,
      companyId: session.company_id,
      company: company || null,
      locations,
      selectedLocationId,
    });
  } catch (error) {
    console.error("[Session] Error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
