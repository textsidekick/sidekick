"use client";

import { Activity, ClipboardList, HardDrive, BarChart3, ShieldAlert, FileText, Users, BookOpen, Target, Brain, Settings } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "operations", label: "Operations", icon: Activity, href: "/operations" },
  { id: "work-orders", label: "Work Orders", icon: ClipboardList, href: "/work-orders" },
  { id: "assets", label: "Assets", icon: HardDrive, href: "/assets" },
  { id: "knowledge", label: "Knowledge", icon: BookOpen, href: "/knowledge" },
  { id: "team", label: "Team", icon: Users, href: "/team" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/analytics" },
  { id: "skill-gaps", label: "Skill Gaps", icon: Target, href: "/skill-gaps" },
  { id: "knowledge-transfer", label: "Transfer", icon: Brain, href: "/knowledge-transfer" },
  { id: "alerts", label: "Alerts", icon: ShieldAlert, href: "/manager?tab=alerts" },
  { id: "documents", label: "Documents", icon: FileText, href: "/manager?tab=documents" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="fixed left-0 top-[57px] bottom-0 w-[220px] bg-white border-r border-gray-200 flex flex-col z-40">
      {/* Nav items */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              (item.href.startsWith("/manager") && pathname === "/manager")
                ? false
                : pathname === item.href ||
                  (item.href !== "/manager" && !item.href.includes("?") && pathname?.startsWith(item.href));
            return (
              <a
                key={item.id}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors",
                  isActive
                    ? "bg-[#C96442]/10 text-[#C96442]"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-[#C96442]" : "")} />
                {item.label}
              </a>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
