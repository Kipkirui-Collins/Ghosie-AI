import { createClient } from "redis";

let client: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (client) return client;

  // Use Upstash Redis (serverless) or local Redis
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  client = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 500)
    }
  });

  client.on("error", (err) => console.error("Redis error:", err));

  await client.connect();
  return client;
}

// Helper to safely close Redis connection
export async function closeRedisClient() {
  if (client) {
    await client.quit();
    client = null;
  }
}

// Cache helper
export async function getCached<T>(key: string, fetcher: () => Promise<T>, ttl: number = 300): Promise<T> {
  try {
    const redis = await getRedisClient();
    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const data = await fetcher();
    await redis.setEx(key, ttl, JSON.stringify(data));
    return data;
  } catch (error) {
    console.warn("Cache miss, falling back to fetcher:", error);
    return fetcher();
  }
}

// Session caching
export async function setCachedSession(userId: string, sessionData: any, ttl: number = 3600) {
  try {
    const redis = await getRedisClient();
    await redis.setEx(`session:${userId}`, ttl, JSON.stringify(sessionData));
  } catch (error) {
    console.warn("Failed to cache session:", error);
  }
}

export async function getCachedSession(userId: string) {
  try {
    const redis = await getRedisClient();
    const cached = await redis.get(`session:${userId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.warn("Failed to retrieve cached session:", error);
    return null;
  }
}
