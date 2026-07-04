"use client";

import { ClipboardList, Wrench, Users, BookOpen, Settings, Home, LogOut, LayoutDashboard, Menu, X, ChevronDown, Building2, BarChart3, ShieldCheck, Sun, Moon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard, href: "/manager" },
  { id: "work-orders", label: "Work Orders", icon: ClipboardList, href: "/work-orders" },
  { id: "plant-metrics", label: "Plant Metrics", icon: BarChart3, href: "/operations" },
  { id: "assets", label: "Assets", icon: Wrench, href: "/assets" },
  { id: "team", label: "Team", icon: Users, href: "/team" },
  { id: "knowledge", label: "Knowledge", icon: BookOpen, href: "/knowledge" },
  { id: "review-queue", label: "Review Queue", icon: ShieldCheck, href: "/review-queue" },
  { id: "settings", label: "Settings", icon: Settings, href: "/settings" },
];

interface Company { id: string; name: string; }

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    // Load saved company from localStorage
    try {
      const authData = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
      if (authData.companyId) setSelectedCompanyId(authData.companyId);
    } catch {}

    try {
      const savedTheme = localStorage.getItem("sidekick_theme");
      const nextTheme = savedTheme === "light" ? "light" : "dark";
      setTheme(nextTheme);
      document.documentElement.classList.toggle("dark", nextTheme === "dark");
    } catch {}

    fetch("/api/companies")
      .then(r => r.json())
      .then(d => {
        const list: Company[] = (d.companies || []).map((c: any) => ({ id: c.id, name: c.name }));
        setCompanies(list);
        // Set first company if none selected
        const saved = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
        if (!saved.companyId && list.length > 0) {
          selectCompany(list[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const selectCompany = (companyId: string) => {
    setSelectedCompanyId(companyId);
    setCompanyDropdownOpen(false);
    try {
      const authData = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
      authData.companyId = companyId;
      localStorage.setItem("sidekick_auth", JSON.stringify(authData));
      // Dispatch storage event so manager page can react
      window.dispatchEvent(new StorageEvent("storage", { key: "sidekick_auth" }));
    } catch {}
  };

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try {
      localStorage.setItem("sidekick_theme", nextTheme);
    } catch {}
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  };

  const sidebarContent = (
    <div className="fixed left-0 top-0 bottom-0 z-50 flex w-[220px] flex-col border-r border-[rgba(28,26,22,0.06)] bg-white dark:border-white/8 dark:bg-[#141416]">
      {/* Logo area */}
      <div className="flex h-16 items-center gap-3 border-b border-[rgba(28,26,22,0.06)] px-5 dark:border-white/8">
        <div style={{ width: 36, height: 36, background: '#C96442', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 5 }}>
          <Image src="/images/logo/newsidekicklogo.png" alt="Sidekick" width={26} height={26} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        </div>
        <span className="text-[18px] font-bold tracking-[-0.02em] text-[#1C1A16] dark:text-white">Sidekick</span>
        <button
          className="ml-auto rounded-lg border border-[rgba(28,26,22,0.08)] bg-[#F7F3EC] p-1.5 text-gray-600 transition-colors hover:bg-[#ede9e1] hover:text-gray-900 dark:border-white/10 dark:bg-[#232329] dark:text-white/70 dark:hover:bg-[#2a2a31] dark:hover:text-white"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        {/* Mobile close button */}
        <button
          className="p-1 text-gray-500 hover:text-gray-900 dark:text-white/55 dark:hover:text-white lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Company Switcher */}
      {companies.length > 0 && (
        <div className="relative border-b border-[rgba(28,26,22,0.06)] px-3 pt-3 pb-2 dark:border-white/8">
          <button
            onClick={() => setCompanyDropdownOpen(v => !v)}
            className="flex w-full items-center gap-2 rounded-lg bg-[#F7F3EC] px-3 py-2 text-left transition-colors hover:bg-[#ede9e1] dark:bg-[#232329] dark:hover:bg-[#2a2a31]"
          >
            <Building2 className="h-4 w-4 flex-shrink-0 text-[#C96442]" />
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-[#1C1A16] dark:text-white/90">
              {selectedCompany?.name || "Select company"}
            </span>
            {companies.length > 1 && <ChevronDown className="h-3 w-3 flex-shrink-0 text-black/40 dark:text-white/40" />}
          </button>
          {companyDropdownOpen && companies.length > 1 && (
            <div className="absolute left-3 right-3 top-full z-50 mt-1 overflow-hidden rounded-xl border border-[rgba(28,26,22,0.08)] bg-white shadow-lg dark:border-white/10 dark:bg-[#1c1c21]">
              {companies.map(c => (
                <button
                  key={c.id}
                  onClick={() => selectCompany(c.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 text-xs font-medium transition-colors",
                    c.id === selectedCompanyId
                      ? "bg-[#C96442]/10 text-[#C96442] dark:bg-[#C96442]/15 dark:text-[#ff9d7a]"
                      : "text-[#1C1A16] hover:bg-[#F7F3EC] dark:text-white/85 dark:hover:bg-[#26262d]"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        <div className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.id === "overview"
                ? pathname === "/manager"
                : (item.href.startsWith("/manager?"))
                  ? false
                  : pathname === item.href ||
                    (!item.href.includes("?") && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors",
                  isActive
                    ? "bg-[#C96442]/10 text-[#C96442] dark:bg-[#C96442]/15 dark:text-[#ff9d7a]"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 dark:text-white/55 dark:hover:bg-[#232329] dark:hover:text-white"
                )}
              >
                <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-[#C96442] dark:text-[#ff9d7a]" : "")} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom actions */}
      <BottomActions onNavigate={() => setMobileOpen(false)} />
    </div>
  );

  return (
    <>
      {/* Hamburger button — mobile only */}
      <button
        className="fixed top-4 left-4 z-[60] rounded-lg border border-[rgba(28,26,22,0.1)] bg-white p-2 text-gray-600 shadow-sm hover:text-gray-900 dark:border-white/10 dark:bg-[#18181b] dark:text-white/70 dark:hover:text-white lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Desktop sidebar — always visible on lg+ */}
      <div className="hidden lg:block">
        {sidebarContent}
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          {/* Slide-in sidebar */}
          <div className="lg:hidden">
            {sidebarContent}
          </div>
        </>
      )}
    </>
  );
}

function BottomActions({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("sidekick_auth");
    document.cookie = "sidekick_auth=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <div className="border-t border-[rgba(28,26,22,0.06)] px-3 py-3 dark:border-white/8">
      <div className="flex flex-col gap-1.5">
        <button
          onClick={() => { onNavigate?.(); router.push("/choose"); }}
          className="flex items-center gap-3 rounded-lg border border-[rgba(28,26,22,0.08)] px-3 py-2.5 text-[14px] font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:text-white/60 dark:hover:bg-[#232329] dark:hover:text-white"
        >
          <Home className="h-4 w-4" />
          Home
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-lg border border-[rgba(28,26,22,0.08)] px-3 py-2.5 text-[14px] font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900 dark:border-white/10 dark:text-white/60 dark:hover:bg-[#232329] dark:hover:text-white"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
