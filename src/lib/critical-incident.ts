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

export type CriticalIncidentMetadata = {
  enabled: true;
  kind: "line_down" | "critical_issue" | "safety_incident";
  title: string;
  summary: string;
  detectedAt: string;
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

export function detectCriticalIncident(message: string, triage: TriageLike): CriticalIncidentMetadata | null {
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

  const kind: CriticalIncidentMetadata["kind"] = isSafetyIncident
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

  return {
    enabled: true,
    kind,
    title,
    summary: issue.symptomSummary?.trim() || issue.priorityReasoning?.trim() || "Critical plant issue reported by text.",
    detectedAt: new Date().toISOString(),
    escalationReason: triage.escalationReason || issue.priorityReasoning || null,
  };
}

export function getCriticalIncidentMeta(aiTriage: Record<string, unknown> | null | undefined): CriticalIncidentMetadata | null {
  if (!aiTriage || typeof aiTriage !== "object") return null;

  const triage = aiTriage as {
    critical_incident?: CriticalIncidentMetadata | null;
    war_room?: {
      enabled?: boolean;
      kind?: CriticalIncidentMetadata["kind"];
      title?: string;
      summary?: string;
      startedAt?: string;
      escalationReason?: string | null;
    } | null;
  };

  if (triage.critical_incident?.enabled) return triage.critical_incident;

  const legacyWarRoom = triage.war_room;
  if (!legacyWarRoom?.enabled || !legacyWarRoom.kind) return null;

  return {
    enabled: true,
    kind: legacyWarRoom.kind,
    title: legacyWarRoom.title || "Critical incident",
    summary: legacyWarRoom.summary || "Critical plant issue reported by text.",
    detectedAt: legacyWarRoom.startedAt || new Date().toISOString(),
    escalationReason: legacyWarRoom.escalationReason || null,
  };
}
