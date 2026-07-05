"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    // Default dashboard landing — Today answers what needs attention now.
    router.replace("/today");
  }, [router]);

  return null;
}
