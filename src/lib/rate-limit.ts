// Simple in-memory rate limiter (resets on serverless cold start — fine for SMS protection)
// For production with multiple instances, swap to Redis/Upstash.

const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, maxRequests = 60, windowMs = 60_000): boolean {
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 0, resetAt: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count++;
  return bucket.count <= maxRequests;
}
