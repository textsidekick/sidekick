"use client";

import { Activity, ClipboardList, HardDrive, BarChart3, ShieldAlert, FileText, Users, BookOpen, Target, Brain, Settings, Home, LogOut } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
    <div className="fixed left-0 top-0 bottom-0 w-[220px] bg-white border-r border-[rgba(28,26,22,0.06)] flex flex-col z-50">
      {/* Logo area — matches TopBar height */}
      <div style={{ height: 56, display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px', borderBottom: '1px solid rgba(28,26,22,0.06)' }}>
        <div style={{ width: 32, height: 32, background: '#C96442', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5 }}>
          <Image src="/images/logo/newsidekicklogo.png" alt="Sidekick" width={22} height={22} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        </div>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#1C1A16', letterSpacing: '-0.02em' }}>Sidekick</span>
      </div>

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

      {/* Bottom actions */}
      <BottomActions />
    </div>
  );
}

function BottomActions() {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("sidekick_auth");
    document.cookie = "sidekick_auth=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <div className="px-3 py-3 border-t border-[rgba(28,26,22,0.06)]">
      <div className="flex gap-2">
        <button
          onClick={() => router.push("/choose")}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors border border-[rgba(28,26,22,0.08)]"
        >
          <Home className="h-4 w-4" />
          Home
        </button>
        <button
          onClick={handleLogout}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors border border-[rgba(28,26,22,0.08)]"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
