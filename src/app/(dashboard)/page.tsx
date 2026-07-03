"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardIndex() {
  const router = useRouter();

  useEffect(() => {
    // Default dashboard landing — the Overview page answers "what needs attention?"
    router.replace("/manager");
  }, [router]);

  return null;
}
