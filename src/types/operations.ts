export type UUID = string;

export type AssetStatus = "operational" | "degraded" | "down" | "decommissioned" | "active" | "unverified";
export type WorkOrderPriority = "critical" | "high" | "medium" | "low";
export type WorkOrderStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "on_hold"
  | "completed"
  | "cancelled";
export type WorkOrderCategory = string;
export type WorkOrderSource =
  | "sms"
  | "voice_note"
  | "photo"
  | "web"
  | "qr_code"
  | "pm_schedule"
  | "ai_generated";

export type PMScheduleFrequencyType = "calendar" | "meter" | "condition";
export type PMScheduleStatus = "active" | "paused" | "completed";

export type WorkerRole = "operator" | "technician" | "supervisor" | "manager";

export interface Asset {
  id: UUID;
  company_id: UUID;
  location_id?: UUID | null;
  name: string;
  asset_tag: string;
  type: string;
  manufacturer: string | null;
  model: string | null;
  serial_number: string | null;
  location: string;
  install_date: string | null; // date
  status: AssetStatus;
  health_score: number;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface WorkOrder {
  id: UUID;
  company_id: UUID;
  location_id?: UUID | null;
  short_id: string; // e.g. WO-0001
  asset_id: UUID | null;
  asset_name?: string | null;
  asset_tag?: string | null;
  reported_by: string;
  worker_phone?: string | null;
  assigned_to: UUID | null;
  assigned_to_phone?: string | null;
  technician_id?: UUID | null;
  title: string;
  description: string;
  original_message: string | null;
  ai_triage: Record<string, unknown>;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  category: WorkOrderCategory;
  source: WorkOrderSource;
  estimated_time_minutes: number | null;
  actual_time_minutes: number | null;
  downtime_cost_estimate?: number | null;
  started_at: string | null;
  completed_at: string | null;
  resolution_notes: string | null;
  parts_used: unknown[]; // json array
  photos: string[]; // URLs
  follow_up_wo_id: UUID | null;
  parent_wo_id: UUID | null;
  created_at: string;
  updated_at: string;
}

export interface PMSchedule {
  id: UUID;
  company_id: UUID;
  location_id?: UUID | null;
  asset_id: UUID;
  title: string;
  description: string;
  checklist: unknown[]; // json array
  frequency_type: PMScheduleFrequencyType;
  frequency_value: number;
  last_completed_at: string | null;
  next_due_at: string;
  assigned_to: UUID | null;
  status: PMScheduleStatus;
  created_at: string;
  updated_at: string;
}

export interface PMCompletion {
  id: UUID;
  pm_schedule_id: UUID;
  work_order_id: UUID;
  completed_by: UUID;
  checklist_results: unknown[];
  findings: string | null;
  photos: string[];
  completed_at: string;
}

export interface PartInventoryItem {
  id: UUID;
  company_id: UUID;
  location_id?: UUID | null;
  name: string;
  part_number: string;
  location: string;
  quantity_on_hand: number;
  reorder_point: number;
  unit_cost: string | number | null;
  supplier: string | null;
  compatible_assets: UUID[] | null;
  created_at: string;
  updated_at: string;
}

export interface ShiftHandoff {
  id: UUID;
  company_id: UUID;
  location_id?: UUID | null;
  shift_name: string;
  outgoing_supervisor: string;
  incoming_supervisor: string | null;
  auto_summary: string;
  manual_notes: string | null;
  work_orders_summary: Record<string, unknown>;
  acknowledged_at: string | null;
  created_at: string;
}

export interface WorkOrderCounter {
  company_id: UUID;
  next_number: number;
  updated_at: string;
}

export interface WorkerOpsFields {
  role: WorkerRole;
  skills: string[];
  shift: string | null;
}

export type InsertAsset = Omit<Asset, "id" | "created_at" | "updated_at">;
export type UpdateAsset = Partial<InsertAsset>;

export type InsertWorkOrder = Omit<WorkOrder, "id" | "short_id" | "created_at" | "updated_at"> & {
  short_id?: string | null; // allow DB to generate
};
export type UpdateWorkOrder = Partial<InsertWorkOrder>;

export type InsertPMSchedule = Omit<PMSchedule, "id" | "created_at" | "updated_at">;
export type UpdatePMSchedule = Partial<InsertPMSchedule>;

export type InsertPMCompletion = Omit<PMCompletion, "id">;
export type UpdatePMCompletion = Partial<InsertPMCompletion>;

export type InsertPartInventoryItem = Omit<PartInventoryItem, "id" | "created_at" | "updated_at">;
export type UpdatePartInventoryItem = Partial<InsertPartInventoryItem>;

export type InsertShiftHandoff = Omit<ShiftHandoff, "id" | "created_at">;
export type UpdateShiftHandoff = Partial<InsertShiftHandoff>;
