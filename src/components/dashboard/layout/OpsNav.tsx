"use client";

import { Activity, ClipboardList, HardDrive, BarChart3, ShieldAlert, FileText, Users, BookOpen, Target, Brain, Building2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Company {
  id: string;
  name: string;
}

const TABS = [
  { id: "operations", label: "Operations", icon: Activity, href: "/operations" },
  { id: "work-orders", label: "Work Orders", icon: ClipboardList, href: "/work-orders" },
  { id: "assets", label: "Assets", icon: HardDrive, href: "/assets" },
  { id: "knowledge", label: "Knowledge", icon: BookOpen, href: "/knowledge" },
  { id: "skill-gaps", label: "Skill Gaps", icon: Target, href: "/skill-gaps" },
  { id: "knowledge-transfer", label: "Transfer", icon: Brain, href: "/knowledge-transfer" },
  { id: "analytics", label: "Analytics", icon: BarChart3, href: "/manager?tab=analytics" },
  { id: "alerts", label: "Alerts", icon: ShieldAlert, href: "/manager?tab=alerts" },
  { id: "documents", label: "Documents", icon: FileText, href: "/manager?tab=documents" },
  { id: "workers", label: "Workers", icon: Users, href: "/manager?tab=workers" },
];

export function OpsNav() {
  const pathname = usePathname();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState("");

  useEffect(() => {
    // Load companies and selected company from localStorage
    fetch("/api/companies")
      .then((r) => r.json())
      .then((d) => {
        const comps = d.companies || [];
        setCompanies(comps);
        
        // Get saved selection from localStorage
        const auth = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
        if (auth.companyId && comps.some((c: Company) => c.id === auth.companyId)) {
          setSelectedCompany(auth.companyId);
        } else if (comps.length > 0) {
          setSelectedCompany(comps[0].id);
          // Save to localStorage
          const existingAuth = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
          existingAuth.companyId = comps[0].id;
          localStorage.setItem("sidekick_auth", JSON.stringify(existingAuth));
        }
      })
      .catch(() => {});
  }, []);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = e.target.value;
    setSelectedCompany(id);
    const auth = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
    auth.companyId = id;
    localStorage.setItem("sidekick_auth", JSON.stringify(auth));
    window.location.reload();
  };

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
                  "flex items-center gap-2 px-3 py-3 text-xs font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                  isActive
                    ? "border-[#C96442] text-gray-900"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                )}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </a>
            );
          })}
        </div>
        
        {/* Company selector */}
        {companies.length > 0 && (
          <div className="flex items-center gap-2 flex-shrink-0 ml-4">
            <Building2 className="h-4 w-4 text-gray-400" />
            <select
              value={selectedCompany}
              onChange={handleCompanyChange}
              className="text-sm font-medium text-gray-700 bg-transparent border-none outline-none cursor-pointer pr-6 py-1 appearance-none"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")", backgroundPosition: "right 0 center", backgroundRepeat: "no-repeat", backgroundSize: "1.25rem" }}
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
}
