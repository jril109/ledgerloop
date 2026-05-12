import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null = null;

if (
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(60, "60 s"),
    prefix: "ledgerloop:rl",
  });
}

export async function checkRateLimit(
  identifier: string
): Promise<{ allowed: boolean; remaining: number }> {
  if (!ratelimit) {
    return { allowed: true, remaining: 60 };
  }
  const result = await ratelimit.limit(identifier);
  return { allowed: result.success, remaining: result.remaining };
}
