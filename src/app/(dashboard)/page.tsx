"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    // Default dashboard landing
    router.replace("/operations");
  }, [router]);

  return null;
}
