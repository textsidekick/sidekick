"use client";

import { ClipboardList, Wrench, Users, BookOpen, Settings, Home, LogOut, LayoutDashboard, Menu, X, ChevronDown, Building2, MessageSquare, RefreshCw, MapPin, FileText, GraduationCap, LibraryBig } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect } from "react";
import { t } from "@/lib/i18n";

function NavItems() {
  const [, setLang] = useState("");
  useEffect(() => {
    const check = () => setLang(localStorage.getItem("sidekick_ui_language") || "en");
    check();
    window.addEventListener("storage", check);
    return () => window.removeEventListener("storage", check);
  }, []);
  return null;
}

const NAV_ITEMS = [
  { id: "today", labelKey: "Overview", icon: LayoutDashboard, href: "/today" },
  { id: "inbox", labelKey: "Inbox", icon: MessageSquare, href: "/inbox" },
  { id: "training", labelKey: "Training", icon: GraduationCap, href: "/training" },
  { id: "knowledge", labelKey: "Knowledge", icon: LibraryBig, href: "/knowledge" },
  { id: "work-orders", labelKey: "Work Orders", icon: ClipboardList, href: "/work-orders" },
  { id: "assets", labelKey: "Assets", icon: Wrench, href: "/assets" },
  { id: "team", labelKey: "Team", icon: Users, href: "/team" },
  { id: "updates", labelKey: "Updates", icon: RefreshCw, href: "/updates" },
  { id: "settings", labelKey: "Settings", icon: Settings, href: "/settings" },
];

interface Location { id: string; name: string; city?: string; state?: string; }
interface Company { id: string; name: string; locations?: Location[]; }

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [, setLangTick] = useState(0);
  useEffect(() => {
    const onStorage = () => setLangTick(n => n + 1);
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);

  useEffect(() => {
    // Load saved company from localStorage
    try {
      const authData = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
      if (authData.companyId) setSelectedCompanyId(authData.companyId);
      if (authData.locationId) setSelectedLocationId(authData.locationId);
    } catch {}

    fetch("/api/companies")
      .then(r => r.json())
      .then(d => {
        const list: Company[] = (d.companies || []).map((c: any) => ({ id: c.id, name: c.name, locations: c.locations || [] }));
        setCompanies(list);
        // Set first company if none selected
        const saved = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
        if (!saved.companyId && list.length > 0) {
          selectCompany(list[0].id);
        }
      })
      .catch(() => {});
  }, []);

  const selectCompany = async (companyId: string) => {
    setSelectedCompanyId(companyId);
    setCompanyDropdownOpen(false);
    const company = companies.find(c => c.id === companyId);
    const nextLocationId = company?.locations?.[0]?.id || "all";
    setSelectedLocationId(nextLocationId);
    setLocationDropdownOpen(false);
    try {
      // Update server session to point to this company
      await fetch("/api/auth/switch-company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
      });
      const authData = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
      authData.companyId = companyId;
      authData.locationId = nextLocationId;
      localStorage.setItem("sidekick_auth", JSON.stringify(authData));
      // Reload page so all data re-fetches with new company
      window.location.reload();
    } catch {}
  };

  const selectLocation = (locationId: string) => {
    setSelectedLocationId(locationId);
    setLocationDropdownOpen(false);
    try {
      const authData = JSON.parse(localStorage.getItem("sidekick_auth") || "{}");
      authData.locationId = locationId;
      localStorage.setItem("sidekick_auth", JSON.stringify(authData));
      window.dispatchEvent(new StorageEvent("storage", { key: "sidekick_auth" }));
    } catch {}
  };

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);
  const selectedLocation = selectedCompany?.locations?.find(location => location.id === selectedLocationId);

  const sidebarContent = (
    <div className="fixed left-0 top-0 bottom-0 w-[220px] bg-[#343A40] border-r border-white/10 flex flex-col z-50">
      {/* Logo area */}
      <div style={{ height: 64, display: 'flex', alignItems: 'center', gap: 12, padding: '0 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Image src="/images/logo/newsidekicklogo.png" alt="Sidekick" width={30} height={30} style={{ objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
        <span style={{ fontSize: 18, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.02em' }}>Sidekick</span>
        {/* Mobile close button */}
        <button
          className="lg:hidden ml-auto p-1 text-slate-300 hover:text-white"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Company Switcher */}
      {companies.length > 0 && (
        <div className="relative px-3 pt-3 pb-2 border-b border-white/10">
          <button
            onClick={() => setCompanyDropdownOpen(v => !v)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors text-left"
          >
            <Building2 className="h-4 w-4 text-[#8DB4D9] flex-shrink-0" />
            <span className="flex-1 min-w-0 text-xs font-medium text-white truncate">
              {selectedCompany?.name || "Select company"}
            </span>
            {companies.length > 1 && <ChevronDown className="h-3 w-3 text-slate-400 flex-shrink-0" />}
          </button>
          {companyDropdownOpen && companies.length > 1 && (
            <div className="absolute left-3 right-3 top-full mt-1 z-50 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              {companies.map(c => (
                <button
                  key={c.id}
                  onClick={() => selectCompany(c.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 text-xs font-medium transition-colors",
                    c.id === selectedCompanyId
                      ? "bg-blue-50 text-[#17202B]"
                      : "text-[#17202B] hover:bg-slate-50"
                  )}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Location Switcher */}
      {selectedCompany && (
        <div className="relative px-3 pt-2 pb-3 border-b border-white/10">
          <button
            onClick={() => setLocationDropdownOpen(v => !v)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-left"
          >
            <MapPin className="h-4 w-4 text-[#8DB4D9] flex-shrink-0" />
            <span className="flex-1 min-w-0 text-xs font-medium text-white truncate">
              {selectedLocation?.name || (selectedCompany.locations?.length ? "All locations" : "Single location")}
            </span>
            {(selectedCompany.locations?.length || 0) > 1 && <ChevronDown className="h-3 w-3 text-slate-400 flex-shrink-0" />}
          </button>
          {locationDropdownOpen && (selectedCompany.locations?.length || 0) > 1 && (
            <div className="absolute left-3 right-3 top-full mt-1 z-50 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => selectLocation("all")}
                className={cn(
                  "w-full text-left px-3 py-2.5 text-xs font-medium transition-colors",
                  selectedLocationId === "all"
                    ? "bg-blue-50 text-[#17202B]"
                    : "text-[#17202B] hover:bg-slate-50"
                )}
              >
                All locations
              </button>
              {selectedCompany.locations?.map(location => (
                <button
                  key={location.id}
                  onClick={() => selectLocation(location.id)}
                  className={cn(
                    "w-full text-left px-3 py-2.5 text-xs font-medium transition-colors",
                    location.id === selectedLocationId
                      ? "bg-blue-50 text-[#17202B]"
                      : "text-[#17202B] hover:bg-slate-50"
                  )}
                >
                  {location.name}
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
              item.id === "today"
                ? pathname === "/today" || pathname === "/manager"
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
                    ? "bg-white/10 text-white"
                    : "text-slate-300 hover:text-white hover:bg-white/5"
                )}
              >
                <item.icon className={cn("h-4 w-4 flex-shrink-0", isActive ? "text-[#8DB4D9]" : "text-slate-400")} />
                {t(item.labelKey)}
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
        className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-white rounded-lg border border-slate-200 shadow-sm text-slate-600 hover:text-[#17202B]"
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

  const handleLogout = async () => {
    try { await fetch("/api/auth/logout", { method: "POST" }); } catch {}
    localStorage.removeItem("sidekick_auth");
    document.cookie = "sidekick_auth=; path=/; max-age=0";
    document.cookie = "sidekick_session=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <div className="px-3 py-3 border-t border-white/10">
      <div className="flex flex-col gap-1.5">
        <button
          onClick={() => { onNavigate?.(); router.push("/choose"); }}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors border border-white/10"
        >
          <Home className="h-4 w-4" />
          {t("Home")}
        </button>
        <button
          onClick={() => { onNavigate?.(); handleLogout(); }}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium text-slate-300 hover:text-white hover:bg-white/5 transition-colors border border-white/10"
        >
          <LogOut className="h-4 w-4" />
          {t("Logout")}
        </button>
      </div>
    </div>
  );
}
