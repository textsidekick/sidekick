/**
 * Simple in-memory rate limiter for API routes.
 * Not distributed — works per-instance. Good enough for Vercel serverless
 * since each cold start gets its own map.
 */

const windows = new Map<string, { count: number; resetAt: number }>();

// Clean old entries periodically
let lastClean = Date.now();
function cleanOld() {
  if (Date.now() - lastClean < 60_000) return;
  lastClean = Date.now();
  const now = Date.now();
  for (const [key, val] of windows) {
    if (val.resetAt < now) windows.delete(key);
  }
}

/**
 * Check rate limit. Returns { allowed, remaining, resetIn }.
 * @param key - unique key (e.g. "api:ip:1.2.3.4" or "api:company:xxx")
 * @param limit - max requests per window
 * @param windowMs - window duration in ms (default 60s)
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; resetIn: number } {
  cleanOld();
  const now = Date.now();
  const entry = windows.get(key);

  if (!entry || entry.resetAt < now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, resetIn: windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, limit - entry.count);
  const resetIn = entry.resetAt - now;

  return { allowed: entry.count <= limit, remaining, resetIn };
}

/**
 * Extract a rate limit key from a request.
 * Uses IP → forwarded-for → x-real-ip → fallback.
 */
export function rateLimitKey(prefix: string, request: Request): string {
  const forwarded = (request.headers as any).get?.("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || (request.headers as any).get?.("x-real-ip") || "unknown";
  return `${prefix}:${ip}`;
}
