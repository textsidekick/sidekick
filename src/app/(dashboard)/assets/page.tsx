"use client";

import React, { useEffect, useMemo, useState } from "react";
import { SectionHeader } from "@/components/dashboard/shared/SectionHeader";
import { MetricCard } from "@/components/dashboard/shared/MetricCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Activity, Plus, TrendingDown, Wrench } from "lucide-react";
import { SkeletonGrid } from "@/components/dashboard/shared/Skeleton";
import { AssetPhotoGallery } from "@/components/dashboard/assets/AssetPhotoGallery";

import type { Asset, AssetStatus, WorkOrder } from "@/types/operations";

type AssetWithStats = Asset & {
  recentWorkOrders: WorkOrder[];
  downtimeHours30d: number;
};

type AddAssetForm = {
  name: string;
  type: string;
  manufacturer: string;
  model: string;
  serial_number: string;
  location: string;
};

function statusPill(status: AssetStatus) {
  const cls =
    status === "operational"
      ? "bg-green-100 text-green-700 ring-1 ring-green-200"
      : status === "degraded"
        ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
        : status === "down"
          ? "bg-red-100 text-red-700 ring-1 ring-red-200"
          : "bg-gray-100 text-gray-700";
  return <span className={cn("text-xs font-medium px-2 py-1 rounded-full", cls)}>{status.toUpperCase()}</span>;
}

function healthGradient(score: number) {
  if (score >= 85) return "text-green-700";
  if (score >= 70) return "text-amber-700";
  return "text-red-700";
}

export default function AssetsPage() {
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<AddAssetForm>({
    name: "",
    type: "Conveyor",
    manufacturer: "",
    model: "",
    serial_number: "",
    location: "",
  });

  useEffect(() => {
    let ignore = false;
    async function loadSession() {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      if (!res.ok) throw new Error("Not authenticated");
      const json = await res.json();
      return json.companyId as string;
    }

    async function run() {
      try {
        setLoading(true);
        setError(null);
        const cid = await loadSession();
        if (!ignore) setCompanyId(cid);

        const [aRes, woRes] = await Promise.all([
          fetch(`/api/operations/assets?companyId=${encodeURIComponent(cid)}`, { cache: "no-store" }),
          fetch(`/api/operations/work-orders?companyId=${encodeURIComponent(cid)}`, { cache: "no-store" }),
        ]);

        if (!aRes.ok) throw new Error(`Assets failed (${aRes.status})`);
        if (!woRes.ok) throw new Error(`Work orders failed (${woRes.status})`);

        const aJson = (await aRes.json()) as { assets: Asset[] };
        const woJson = (await woRes.json()) as { workOrders: WorkOrder[] };

        if (ignore) return;
        setAssets(aJson.assets || []);
        setWorkOrders(woJson.workOrders || []);
      } catch (e: any) {
        if (!ignore) setError(e?.message || "Failed to load");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, []);

  const plantHealth = useMemo(() => {
    if (!assets.length) return 0;
    return Math.round(assets.reduce((acc, a) => acc + (Number(a.health_score) || 0), 0) / assets.length);
  }, [assets]);

  const enriched: AssetWithStats[] = useMemo(() => {
    const now = Date.now();
    const d30 = now - 30 * 24 * 60 * 60 * 1000;

    return assets.map((a) => {
      const history = workOrders
        .filter((w) => w.asset_id === a.id)
        .sort((x, y) => new Date(y.created_at).getTime() - new Date(x.created_at).getTime());

      const downtimeMinutes30d = history
        .filter((w) => w.status === "completed" && w.completed_at && new Date(w.completed_at).getTime() >= d30)
        .reduce((acc, w) => acc + (Number(w.actual_time_minutes) || 0), 0);

      return {
        ...a,
        recentWorkOrders: history.slice(0, 8),
        downtimeHours30d: downtimeMinutes30d / 60,
      };
    });
  }, [assets, workOrders]);

  const searchLower = search.toLowerCase();
  const filteredEnriched = search.trim()
    ? enriched.filter(
        (a) =>
          a.name?.toLowerCase().includes(searchLower) ||
          a.type?.toLowerCase().includes(searchLower) ||
          a.location?.toLowerCase().includes(searchLower)
      )
    : enriched;

  const declining = enriched
    .filter((a) => a.health_score < 70)
    .sort((a, b) => a.health_score - b.health_score)
    .slice(0, 4);

  const frequentIssues = enriched
    .map((a) => ({ a, count7d: a.recentWorkOrders.filter((w) => Date.now() - new Date(w.created_at).getTime() < 7 * 86400_000).length }))
    .filter((x) => x.count7d >= 3)
    .sort((x, y) => y.count7d - x.count7d)
    .slice(0, 4);

  async function createAsset() {
    if (!companyId) return;
    try {
      setSaving(true);
      const res = await fetch("/api/operations/assets", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          asset: {
            company_id: companyId,
            name: form.name,
            asset_tag: form.name.replaceAll(" ", "-").toUpperCase().slice(0, 16) || "ASSET",
            type: form.type,
            manufacturer: form.manufacturer || null,
            model: form.model || null,
            serial_number: form.serial_number || null,
            location: form.location,
            install_date: null,
            status: "operational",
            health_score: 90,
            notes: null,
            metadata: {},
          },
        }),
      });

      if (!res.ok) throw new Error(`Create failed (${res.status})`);

      const aRes = await fetch(`/api/operations/assets?companyId=${encodeURIComponent(companyId)}`, { cache: "no-store" });
      if (aRes.ok) {
        const aJson = (await aRes.json()) as { assets: Asset[] };
        setAssets(aJson.assets || []);
      }
      setShowAdd(false);
      setForm({ name: "", type: "Conveyor", manufacturer: "", model: "", serial_number: "", location: "" });
    } catch (e: any) {
      setError(e?.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Assets</h1>
            <p className="text-sm text-black/50 mt-1">Asset health, history, repair time, and more.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => (window.location.href = "/operations")}>Operations</Button>
            <Button variant="outline" onClick={() => (window.location.href = "/work-orders")}>Work Orders</Button>
            <Button onClick={() => setShowAdd(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Asset
            </Button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <MetricCard label="Overall plant health" value={loading ? "—" : `${plantHealth}/100`} icon={Activity} accentColor="emerald" />
          <MetricCard label="Assets" value={loading ? "—" : String(assets.length)} icon={Wrench} accentColor="amber" />
          <MetricCard label="Declining assets" value={loading ? "—" : String(declining.length)} icon={TrendingDown} accentColor={declining.length ? "red" : undefined} />
        </div>

        {!!error && (
          <div className="mt-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>
        )}

        <div className="mt-8 rounded-2xl bg-white border border-black/5 p-6">
          <SectionHeader title="Asset health overview" subtitle="Watch what’s trending down or spiking in issues" />

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border border-black/5 p-4">
              <div className="text-sm font-medium">Declining health</div>
              <div className="mt-3 space-y-2">
                {declining.length === 0 && <div className="text-sm text-black/50">No declining assets.</div>}
                {declining.map((a) => (
                  <div key={a.id} className="flex items-center justify-between">
                    <div className="text-sm">{a.name}</div>
                    <div className={cn("text-sm font-medium", healthGradient(a.health_score))}>{a.health_score}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-black/5 p-4">
              <div className="text-sm font-medium">Frequent issues (7d)</div>
              <div className="mt-3 space-y-2">
                {frequentIssues.length === 0 && <div className="text-sm text-black/50">No assets with frequent issues this week.</div>}
                {frequentIssues.map(({ a, count7d }) => (
                  <div key={a.id} className="flex items-center justify-between">
                    <div className="text-sm">{a.name}</div>
                    <div className="text-sm font-medium text-amber-700">{count7d} WOs</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets by name, type, or location…"
            className="w-full px-4 py-2.5 rounded-xl border border-black/10 bg-white text-sm outline-none focus:border-black/20"
          />
          {search && (
            <div className="mt-1 text-xs text-black/40">{filteredEnriched.length} result{filteredEnriched.length !== 1 ? "s" : ""}</div>
          )}
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading && <SkeletonGrid cols={3} rows={2} />}
          {filteredEnriched.map((a) => {
            const isOpen = expanded === a.id;
            return (
              <div
                key={a.id}
                className={cn(
                  "rounded-2xl bg-white border border-black/5 p-5 cursor-pointer transition",
                  isOpen && "ring-2 ring-black/10"
                )}
                onClick={() => setExpanded((cur) => (cur === a.id ? null : a.id))}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-medium">{a.name}</div>
                    <div className="mt-1 text-sm text-black/50">{a.type} · {a.location}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {statusPill(a.status)}
                    <div className={cn("text-sm font-semibold", healthGradient(a.health_score))}>{a.health_score}</div>
                  </div>
                </div>

                {isOpen && (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-xl border border-black/5 p-4">
                      <div className="text-sm font-medium">Work order history</div>
                      <div className="mt-2 space-y-2">
                        {a.recentWorkOrders.length === 0 && <div className="text-sm text-black/50">No work orders yet.</div>}
                        {a.recentWorkOrders.map((w) => (
                          <div key={w.id} className="flex items-start justify-between gap-2">
                            <div>
                              <div className="text-sm font-medium">{w.short_id} · {w.title}</div>
                              <div className="text-xs text-black/50">{new Date(w.created_at).toLocaleString()}</div>
                            </div>
                            <span className={cn("text-xs px-2 py-1 rounded-full", w.status === "completed" ? "bg-green-100 text-green-700 ring-1 ring-green-200" : "bg-black/5 text-black/70")}>
                              {w.status.replaceAll("_", " ")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <AssetPhotoGallery assetId={a.id} />

                    <div className="rounded-xl border border-black/5 p-4">
                      <div className="text-sm font-medium">Repair Time (30d)</div>
                      <div className="mt-2 text-sm text-black/60">{a.downtimeHours30d.toFixed(1)}h</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Add asset</DialogTitle>
            <DialogDescription>Create a new asset in this plant.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-black/40 mb-2">Name</div>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full h-10 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/20"
                placeholder="Conveyor 3"
              />
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-black/40 mb-2">Type</div>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Conveyor">Conveyor</SelectItem>
                  <SelectItem value="CNC">CNC</SelectItem>
                  <SelectItem value="Press">Press</SelectItem>
                  <SelectItem value="Pump">Pump</SelectItem>
                  <SelectItem value="Motor">Motor</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-black/40 mb-2">Manufacturer</div>
              <input
                value={form.manufacturer}
                onChange={(e) => setForm((f) => ({ ...f, manufacturer: e.target.value }))}
                className="w-full h-10 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/20"
                placeholder="ACME"
              />
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-black/40 mb-2">Model</div>
              <input
                value={form.model}
                onChange={(e) => setForm((f) => ({ ...f, model: e.target.value }))}
                className="w-full h-10 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/20"
                placeholder="CVR-300"
              />
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-black/40 mb-2">Serial number</div>
              <input
                value={form.serial_number}
                onChange={(e) => setForm((f) => ({ ...f, serial_number: e.target.value }))}
                className="w-full h-10 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/20"
                placeholder="SN-12345"
              />
            </div>

            <div>
              <div className="text-xs uppercase tracking-wide text-black/40 mb-2">Location</div>
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full h-10 rounded-md border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/20"
                placeholder="Line 2"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAdd(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={createAsset} disabled={saving || !form.name.trim() || !form.location.trim()}>
              {saving ? "Creating…" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
