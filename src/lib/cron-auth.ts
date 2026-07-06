import { NextRequest } from "next/server";

/**
 * Verify cron job authorization.
 * Accepts: ?secret=X, x-cron-secret header, or Vercel's Authorization: Bearer header.
 */
export function verifyCronSecret(req: NextRequest): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;

  const fromParam = req.nextUrl.searchParams.get("secret");
  if (fromParam === expected) return true;

  const fromHeader = req.headers.get("x-cron-secret");
  if (fromHeader === expected) return true;

  // Vercel cron sends Authorization: Bearer <CRON_SECRET>
  const auth = req.headers.get("authorization");
  if (auth && auth.startsWith("Bearer ") && auth.slice(7) === expected) return true;

  return false;
}
