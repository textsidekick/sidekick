"use client";

import { Activity, ClipboardList, HardDrive, BarChart3, ShieldAlert, FileText, Users, Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "operations", label: "Operations", icon: Activity, href: "/operations" },
  { id: "work-orders", label: "Work Orders", icon: ClipboardList, href: "/work-orders" },
  { id: "assets", label: "Assets", icon: HardDrive, href: "/assets" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/manager?tab=analytics" },
  { id: "alerts", label: "Alerts", icon: ShieldAlert, href: "/manager?tab=alerts" },
  { id: "documents", label: "Documents", icon: FileText, href: "/manager?tab=documents" },
  { id: "workers", label: "Workers", icon: Users, href: "/manager?tab=workers" },
];

export function OpsNav() {
  const pathname = usePathname();

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex gap-0 overflow-x-auto">
          {TABS.map((tab) => {
            const isActive =
              (tab.href.startsWith("/manager") && pathname === "/manager") ? false :
              pathname === tab.href || 
              (tab.href !== "/manager" && !tab.href.includes("?") && pathname?.startsWith(tab.href));
            return (
              <a
                key={tab.id}
                href={tab.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                  isActive
                    ? "border-[#C96442] text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}
