const TRAINING_REQUEST_PATTERNS = [
  /\bhow do i\b/i,
  /\bhow to\b/i,
  /\bwhat'?s the process\b/i,
  /\bwalk me through\b/i,
  /\bshow me how\b/i,
  /\bprocedure\b/i,
  /\bsop\b/i,
  /\bsteps?\b/i,
  /\bstartup\b/i,
  /\bstart up\b/i,
  /\bshut ?down\b/i,
  /\bchangeover\b/i,
  /\bclean(ing)?\b/i,
  /\blockout\b/i,
  /\bloto\b/i,
  /\breset\b/i,
  /\btroubleshoot\b/i,
  /\btrain(ing)?\b/i,
  /\bhow can i\b/i,
  /\bc[oó]mo\b/i,
  /\bprocedimiento\b/i,
  /\bpasos\b/i,
  /\bencender\b/i,
  /\bapagar\b/i,
  /\blimpiar\b/i,
  /\bcambio\b/i,
  /\bbloqueo\b/i,
];

const TRAINING_FOLLOW_UP_MAP: Array<{ kind: TrainingCoachFollowUpKind; patterns: RegExp[] }> = [
  {
    kind: "done",
    patterns: [/^done$/i, /^completed?$/i, /^finished?$/i, /^fixed$/i, /^hecho$/i, /^listo$/i, /^terminado$/i],
  },
  {
    kind: "help",
    patterns: [/^help$/i, /^stuck$/i, /^need help$/i, /^not sure$/i, /^issue$/i, /^problem$/i, /^ayuda$/i, /^atorado$/i, /^no se$/i],
  },
  {
    kind: "next",
    patterns: [/^next$/i, /^more$/i, /^continue$/i, /^siguiente$/i, /^mas$/i, /^más$/i],
  },
];

export const TRAINING_COACH_TOPIC = "training_coach";
export const TRAINING_COACH_FOLLOW_UP_TOPIC = "training_coach_followup";

export type TrainingCoachFollowUpKind = "done" | "help" | "next";

export function isTrainingCoachRequest(text: string): boolean {
  const normalized = text.trim();
  if (!normalized) return false;
  return TRAINING_REQUEST_PATTERNS.some((pattern) => pattern.test(normalized));
}

export function getTrainingCoachFollowUpKind(text: string): TrainingCoachFollowUpKind | null {
  const normalized = text.trim();
  if (!normalized) return null;

  for (const item of TRAINING_FOLLOW_UP_MAP) {
    if (item.patterns.some((pattern) => pattern.test(normalized))) {
      return item.kind;
    }
  }

  return null;
}

export function isTrainingCoachTopic(topic?: string | null): boolean {
  return topic === TRAINING_COACH_TOPIC || topic === TRAINING_COACH_FOLLOW_UP_TOPIC;
}
