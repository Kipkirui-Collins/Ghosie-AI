import { createClient } from "redis";

let client: ReturnType<typeof createClient> | null = null;
let redisAvailable = true;
let lastErrorLogged = 0;

export async function getRedisClient() {
  if (client) return client;
  if (!redisAvailable) return null;

  // Use Upstash Redis (serverless) or local Redis
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  client = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => {
        // Stop retrying after 5 attempts to avoid infinite reconnect spam
        if (retries > 5) {
          return new Error("Redis connection failed - giving up");
        }
        return Math.min(retries * 50, 500);
      }
    }
  });

  client.on("error", (err) => {
    // Log only once per 30 seconds to avoid console spam
    const now = Date.now();
    if (now - lastErrorLogged > 30000) {
      console.warn("Redis unavailable:", err.message);
      lastErrorLogged = now;
    }
    redisAvailable = false;
    client = null;
  });

  client.on("ready", () => {
    redisAvailable = true;
  });

  try {
    await client.connect();
    return client;
  } catch (error) {
    redisAvailable = false;
    client = null;
    return null;
  }
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
    if (!redis) return fetcher();

    const cached = await redis.get(key);
    if (cached) {
      return JSON.parse(cached);
    }

    const data = await fetcher();
    await redis.setEx(key, ttl, JSON.stringify(data));
    return data;
  } catch (error) {
    return fetcher();
  }
}

// Session caching
export async function setCachedSession(userId: string, sessionData: any, ttl: number = 3600) {
  try {
    const redis = await getRedisClient();
    if (!redis) return;
    await redis.setEx(`session:${userId}`, ttl, JSON.stringify(sessionData));
  } catch (error) {
    // Silently ignore - caching is best-effort
  }
}

export async function getCachedSession(userId: string) {
  try {
    const redis = await getRedisClient();
    if (!redis) return null;
    const cached = await redis.get(`session:${userId}`);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    return null;
  }
}