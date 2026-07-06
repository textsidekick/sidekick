type TriageIssueLike = {
  assetName?: string | null;
  category?: string | null;
  priority?: string | null;
  priorityReasoning?: string | null;
  symptomSummary?: string | null;
  safetyWarnings?: string[] | null;
};

type TriageLike = {
  messageType?: string | null;
  issue?: TriageIssueLike | null;
  escalate?: boolean | null;
  escalationReason?: string | null;
};

export type WarRoomMetadata = {
  enabled: true;
  kind: "line_down" | "critical_issue" | "safety_incident";
  title: string;
  summary: string;
  startedAt: string;
  nextAction: string;
  playbook: string[];
  escalationReason: string | null;
};

const LINE_DOWN_PATTERNS = [
  /\bline\s*\d+\b/i,
  /\bline\b.*\bdown\b/i,
  /\bdown\b/i,
  /\bstopped\b/i,
  /\bnot running\b/i,
  /\bproduction stopped\b/i,
  /\bwon'?t start\b/i,
  /\bwill not start\b/i,
  /\bjammed\b/i,
  /\boutage\b/i,
  /\bno power\b/i,
  /\bhalted\b/i,
];

const SAFETY_PATTERNS = [
  /\bsmoke\b/i,
  /\bfire\b/i,
  /\bspark\b/i,
  /\bchemical\b/i,
  /\bspill\b/i,
  /\binjury\b/i,
  /\bgas leak\b/i,
  /\benergized\b/i,
  /\bshock\b/i,
];

export function detectWarRoom(message: string, triage: TriageLike): WarRoomMetadata | null {
  if (triage.messageType !== "issue_report" || !triage.issue) return null;

  const lowerMessage = message.toLowerCase();
  const issue = triage.issue;
  const isSafetyIncident =
    issue.category === "safety" ||
    (issue.safetyWarnings || []).length > 0 ||
    SAFETY_PATTERNS.some((pattern) => pattern.test(lowerMessage));
  const isLineDown =
    LINE_DOWN_PATTERNS.some((pattern) => pattern.test(lowerMessage)) ||
    /\bline down\b/i.test(issue.symptomSummary || "") ||
    /\bstopped\b/i.test(issue.symptomSummary || "");
  const isCritical = issue.priority === "critical" || Boolean(triage.escalate);

  if (!isSafetyIncident && !isLineDown && !isCritical) return null;

  const kind: WarRoomMetadata["kind"] = isSafetyIncident
    ? "safety_incident"
    : isLineDown
      ? "line_down"
      : "critical_issue";

  const asset = issue.assetName?.trim() || "the affected asset";
  const title =
    kind === "line_down"
      ? `${asset} line-down incident`
      : kind === "safety_incident"
        ? `${asset} safety incident`
        : `${asset} critical incident`;

  const playbook =
    kind === "safety_incident"
      ? [
          "Secure the area and verify people are safe.",
          "Assign an owner and confirm who is responding.",
          "Capture ETA, blocker, and whether operations are stopped.",
          "Close with resolution + follow-up actions.",
        ]
      : [
          "Assign an owner immediately.",
          "Confirm line / asset status and downtime start.",
          "Get tech ETA and blockers in one thread.",
          "Close the loop with resolution + lessons learned.",
        ];

  return {
    enabled: true,
    kind,
    title,
    summary: issue.symptomSummary?.trim() || issue.priorityReasoning?.trim() || "Critical plant issue reported by text.",
    startedAt: new Date().toISOString(),
    nextAction: isCritical ? "Confirm owner, ETA, and downtime impact." : "Assign owner and confirm current line status.",
    playbook,
    escalationReason: triage.escalationReason || issue.priorityReasoning || null,
  };
}

export function getWarRoomMeta(aiTriage: Record<string, unknown> | null | undefined): WarRoomMetadata | null {
  if (!aiTriage || typeof aiTriage !== "object") return null;
  const warRoom = (aiTriage as { war_room?: WarRoomMetadata | null }).war_room;
  if (!warRoom?.enabled) return null;
  return warRoom;
}

export function isWarRoomWorkOrder(aiTriage: Record<string, unknown> | null | undefined): boolean {
  return Boolean(getWarRoomMeta(aiTriage));
}

export function getWarRoomStatus(status: string): { label: string; nextAction: string } {
  switch (status) {
    case "completed":
      return { label: "Resolved", nextAction: "Postmortem and knowledge capture." };
    case "in_progress":
      return { label: "Tech responding", nextAction: "Track ETA, blocker, and recovery updates." };
    case "assigned":
      return { label: "Owner assigned", nextAction: "Confirm ETA and whether the line is still down." };
    case "on_hold":
      return { label: "Blocked", nextAction: "Unblock parts, approval, vendor, or access." };
    case "cancelled":
      return { label: "Cancelled", nextAction: "Confirm if a follow-up incident is still needed." };
    default:
      return { label: "Active", nextAction: "Assign owner and confirm the current plant status." };
  }
}

export function formatDurationMinutes(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return "0m";
  if (totalMinutes < 60) return `${Math.round(totalMinutes)}m`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}

export function formatCompactCost(amount: number | null | undefined): string | null {
  if (!Number.isFinite(Number(amount))) return null;
  const value = Number(amount);
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
  return `$${Math.round(value)}`;
}
