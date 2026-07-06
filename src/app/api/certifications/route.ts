import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getCompanyId } from "@/lib/dashboard-auth";

export async function GET(request: NextRequest) {
  const companyId = await getCompanyId(request);
  if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const workerPhone = request.nextUrl.searchParams.get("workerPhone");

  try {
    let query = supabase
      .from("certifications")
      .select("*")
      .eq("company_id", companyId)
      .order("expiry_date", { ascending: true });

    if (workerPhone) {
      query = query.eq("worker_phone", workerPhone);
    }

    const { data: certifications, error } = await query;

    if (error) {
      console.error("Certifications fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch certifications" }, { status: 500 });
    }

    // Calculate stats
    const allCerts = certifications || [];
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const expired = allCerts.filter(c => new Date(c.expiry_date) < now);
    const expiringThisWeek = allCerts.filter(c => {
      const exp = new Date(c.expiry_date);
      return exp >= now && exp <= sevenDaysFromNow;
    });
    const expiringThisMonth = allCerts.filter(c => {
      const exp = new Date(c.expiry_date);
      return exp > sevenDaysFromNow && exp <= thirtyDaysFromNow;
    });
    const valid = allCerts.filter(c => new Date(c.expiry_date) > thirtyDaysFromNow);

    // Group by cert type
    const byCertType: Record<string, number> = {};
    allCerts.forEach(c => {
      byCertType[c.cert_type] = (byCertType[c.cert_type] || 0) + 1;
    });

    return NextResponse.json({
      certifications: allCerts,
      stats: {
        total: allCerts.length,
        expired: expired.length,
        expiringThisWeek: expiringThisWeek.length,
        expiringThisMonth: expiringThisMonth.length,
        valid: valid.length,
        byCertType,
      },
      expiring: {
        thisWeek: expiringThisWeek,
        thisMonth: expiringThisMonth,
        expired,
      }
    });

  } catch (error) {
    console.error("Certifications error:", error);
    return NextResponse.json({ error: "Failed to fetch certifications" }, { status: 500 });
  }
}

// Add new certification
export async function POST(request: NextRequest) {
  try {
    const companyId = await getCompanyId(request);
    if (!companyId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { workerPhone, workerName, certType, certName, expiryDate, issuedDate, certNumber } = await request.json();

    if (!workerPhone || !certType || !expiryDate) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("certifications")
      .insert({
        company_id: companyId,
        worker_phone: workerPhone,
        worker_name: workerName || null,
        cert_type: certType,
        cert_name: certName || certType,
        expiry_date: expiryDate,
        issued_date: issuedDate || null,
        cert_number: certNumber || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Certification create error:", error);
      return NextResponse.json({ error: "Failed to create certification" }, { status: 500 });
    }

    return NextResponse.json({ success: true, certification: data });

  } catch (error) {
    console.error("Certification create error:", error);
    return NextResponse.json({ error: "Failed to create certification" }, { status: 500 });
  }
}

// Update certification
export async function PATCH(request: NextRequest) {
  try {
    const { certId, expiryDate, certNumber } = await request.json();

    if (!certId) {
      return NextResponse.json({ error: "Certification ID required" }, { status: 400 });
    }

    const updates: any = {};
    if (expiryDate) updates.expiry_date = expiryDate;
    if (certNumber) updates.cert_number = certNumber;

    const { data, error } = await supabase
      .from("certifications")
      .update(updates)
      .eq("id", certId)
      .select()
      .single();

    if (error) {
      console.error("Certification update error:", error);
      return NextResponse.json({ error: "Failed to update certification" }, { status: 500 });
    }

    return NextResponse.json({ success: true, certification: data });

  } catch (error) {
    console.error("Certification update error:", error);
    return NextResponse.json({ error: "Failed to update certification" }, { status: 500 });
  }
}

// Delete certification
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const certId = searchParams.get("certId");

  if (!certId) {
    return NextResponse.json({ error: "Certification ID required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("certifications")
    .delete()
    .eq("id", certId);

  if (error) {
    return NextResponse.json({ error: "Failed to delete certification" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
