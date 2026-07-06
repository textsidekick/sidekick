import { supabase } from "@/lib/supabase";
import type {
  Asset,
  InsertAsset,
  UpdateAsset,
  WorkOrder,
  InsertWorkOrder,
  UpdateWorkOrder,
  PMSchedule,
  InsertPMSchedule,
  UpdatePMSchedule,
  PMCompletion,
  InsertPMCompletion,
  UpdatePMCompletion,
  PartInventoryItem,
  InsertPartInventoryItem,
  UpdatePartInventoryItem,
  ShiftHandoff,
  InsertShiftHandoff,
  UpdateShiftHandoff,
  UUID,
} from "@/types/operations";

// Note: This project currently uses the service role supabase client server-side.
// These functions assume RLS/company scoping is handled either by JWT claims
// or by passing company_id explicitly in queries where needed.

// -----------------------------------------------------------------------------
// Assets
// -----------------------------------------------------------------------------
export async function listAssets(companyId: UUID, opts?: { locationId?: UUID | "all" | null }): Promise<Asset[]> {
  let q = supabase
    .from("assets")
    .select("*")
    .eq("company_id", companyId);

  if (opts?.locationId && opts.locationId !== "all") q = q.eq("location_id", opts.locationId);

  const { data, error } = await q.order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as Asset[];
}

export async function getAsset(id: UUID, companyId?: UUID): Promise<Asset | null> {
  const q = supabase.from("assets").select("*").eq("id", id);
  if (companyId) q.eq("company_id", companyId);
  const { data, error } = await q.single();
  if (error) return null;
  return data as Asset;
}

export async function createAsset(asset: InsertAsset): Promise<Asset> {
  const { data, error } = await supabase.from("assets").insert(asset).select("*").single();
  if (error) throw error;
  return data as Asset;
}

export async function updateAsset(id: UUID, patch: UpdateAsset, companyId?: UUID): Promise<Asset> {
  const q = supabase.from("assets").update(patch).eq("id", id);
  if (companyId) q.eq("company_id", companyId);
  const { data, error } = await q.select("*").single();
  if (error) throw error;
  return data as Asset;
}

export async function deleteAsset(id: UUID, companyId?: UUID): Promise<void> {
  const q = supabase.from("assets").delete().eq("id", id);
  if (companyId) q.eq("company_id", companyId);
  const { error } = await q;
  if (error) throw error;
}

// -----------------------------------------------------------------------------
// Work Orders
// -----------------------------------------------------------------------------
export async function listWorkOrders(companyId: UUID, opts?: { status?: string; priority?: string; assetId?: UUID; locationId?: UUID | "all" | null }): Promise<WorkOrder[]> {
  let q = supabase.from("work_orders").select("*").eq("company_id", companyId);
  if (opts?.status) q = q.eq("status", opts.status);
  if (opts?.priority) q = q.eq("priority", opts.priority);
  if (opts?.assetId) q = q.eq("asset_id", opts.assetId);
  if (opts?.locationId && opts.locationId !== "all") q = q.eq("location_id", opts.locationId);

  const { data, error } = await q.order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as WorkOrder[];
}

export async function getWorkOrder(id: UUID, companyId?: UUID): Promise<WorkOrder | null> {
  const q = supabase.from("work_orders").select("*").eq("id", id);
  if (companyId) q.eq("company_id", companyId);
  const { data, error } = await q.single();
  if (error) return null;
  return data as WorkOrder;
}

export async function createWorkOrder(workOrder: InsertWorkOrder): Promise<WorkOrder> {
  const { data, error } = await supabase.from("work_orders").insert(workOrder).select("*").single();
  if (error) throw error;
  return data as WorkOrder;
}

export async function updateWorkOrder(id: UUID, patch: UpdateWorkOrder, companyId?: UUID): Promise<WorkOrder> {
  const q = supabase.from("work_orders").update(patch).eq("id", id);
  if (companyId) q.eq("company_id", companyId);
  const { data, error } = await q.select("*").single();
  if (error) throw error;
  return data as WorkOrder;
}

export async function deleteWorkOrder(id: UUID, companyId?: UUID): Promise<void> {
  const q = supabase.from("work_orders").delete().eq("id", id);
  if (companyId) q.eq("company_id", companyId);
  const { error } = await q;
  if (error) throw error;
}

// -----------------------------------------------------------------------------
// PM Schedules
// -----------------------------------------------------------------------------
export async function listPMSchedules(companyId: UUID, opts?: { assetId?: UUID; status?: string }): Promise<PMSchedule[]> {
  let q = supabase.from("pm_schedules").select("*").eq("company_id", companyId);
  if (opts?.assetId) q = q.eq("asset_id", opts.assetId);
  if (opts?.status) q = q.eq("status", opts.status);

  const { data, error } = await q.order("next_due_at", { ascending: true });
  if (error) throw error;
  return (data || []) as PMSchedule[];
}

export async function getPMSchedule(id: UUID, companyId?: UUID): Promise<PMSchedule | null> {
  const q = supabase.from("pm_schedules").select("*").eq("id", id);
  if (companyId) q.eq("company_id", companyId);
  const { data, error } = await q.single();
  if (error) return null;
  return data as PMSchedule;
}

export async function createPMSchedule(schedule: InsertPMSchedule): Promise<PMSchedule> {
  const { data, error } = await supabase.from("pm_schedules").insert(schedule).select("*").single();
  if (error) throw error;
  return data as PMSchedule;
}

export async function updatePMSchedule(id: UUID, patch: UpdatePMSchedule, companyId?: UUID): Promise<PMSchedule> {
  const q = supabase.from("pm_schedules").update(patch).eq("id", id);
  if (companyId) q.eq("company_id", companyId);
  const { data, error } = await q.select("*").single();
  if (error) throw error;
  return data as PMSchedule;
}

export async function deletePMSchedule(id: UUID, companyId?: UUID): Promise<void> {
  const q = supabase.from("pm_schedules").delete().eq("id", id);
  if (companyId) q.eq("company_id", companyId);
  const { error } = await q;
  if (error) throw error;
}

// -----------------------------------------------------------------------------
// PM Completions
// -----------------------------------------------------------------------------
export async function listPMCompletions(pmScheduleId: UUID): Promise<PMCompletion[]> {
  const { data, error } = await supabase
    .from("pm_completions")
    .select("*")
    .eq("pm_schedule_id", pmScheduleId)
    .order("completed_at", { ascending: false });

  if (error) throw error;
  return (data || []) as PMCompletion[];
}

export async function createPMCompletion(completion: InsertPMCompletion): Promise<PMCompletion> {
  const { data, error } = await supabase.from("pm_completions").insert(completion).select("*").single();
  if (error) throw error;
  return data as PMCompletion;
}

export async function updatePMCompletion(id: UUID, patch: UpdatePMCompletion): Promise<PMCompletion> {
  const { data, error } = await supabase
    .from("pm_completions")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as PMCompletion;
}

export async function deletePMCompletion(id: UUID): Promise<void> {
  const { error } = await supabase.from("pm_completions").delete().eq("id", id);
  if (error) throw error;
}

// -----------------------------------------------------------------------------
// Parts Inventory
// -----------------------------------------------------------------------------
export async function listParts(companyId: UUID): Promise<PartInventoryItem[]> {
  const { data, error } = await supabase
    .from("parts_inventory")
    .select("*")
    .eq("company_id", companyId)
    .order("name", { ascending: true });

  if (error) throw error;
  return (data || []) as PartInventoryItem[];
}

export async function createPart(part: InsertPartInventoryItem): Promise<PartInventoryItem> {
  const { data, error } = await supabase.from("parts_inventory").insert(part).select("*").single();
  if (error) throw error;
  return data as PartInventoryItem;
}

export async function updatePart(id: UUID, patch: UpdatePartInventoryItem, companyId?: UUID): Promise<PartInventoryItem> {
  const q = supabase.from("parts_inventory").update(patch).eq("id", id);
  if (companyId) q.eq("company_id", companyId);
  const { data, error } = await q.select("*").single();
  if (error) throw error;
  return data as PartInventoryItem;
}

export async function deletePart(id: UUID, companyId?: UUID): Promise<void> {
  const q = supabase.from("parts_inventory").delete().eq("id", id);
  if (companyId) q.eq("company_id", companyId);
  const { error } = await q;
  if (error) throw error;
}

// -----------------------------------------------------------------------------
// Shift Handoffs
// -----------------------------------------------------------------------------
export async function listShiftHandoffs(companyId: UUID): Promise<ShiftHandoff[]> {
  const { data, error } = await supabase
    .from("shift_handoffs")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as ShiftHandoff[];
}

export async function createShiftHandoff(handoff: InsertShiftHandoff): Promise<ShiftHandoff> {
  const { data, error } = await supabase.from("shift_handoffs").insert(handoff).select("*").single();
  if (error) throw error;
  return data as ShiftHandoff;
}

export async function updateShiftHandoff(id: UUID, patch: UpdateShiftHandoff, companyId?: UUID): Promise<ShiftHandoff> {
  const q = supabase.from("shift_handoffs").update(patch).eq("id", id);
  if (companyId) q.eq("company_id", companyId);
  const { data, error } = await q.select("*").single();
  if (error) throw error;
  return data as ShiftHandoff;
}

export async function deleteShiftHandoff(id: UUID, companyId?: UUID): Promise<void> {
  const q = supabase.from("shift_handoffs").delete().eq("id", id);
  if (companyId) q.eq("company_id", companyId);
  const { error } = await q;
  if (error) throw error;
}
