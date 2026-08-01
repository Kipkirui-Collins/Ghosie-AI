import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getServerSessionUser } from "../../../lib/auth";
import { getCached } from "../../../lib/redis";

export async function GET(request: Request) {
  const user = await getServerSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversations = await getCached(
    `conversations:${user.id}`,
    async () => {
      return prisma.conversation.findMany({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
        include: { messages: { orderBy: { createdAt: "asc" }, take: 1 } }
      });
    },
    60 // Cache for 60 seconds
  );

  return NextResponse.json(conversations);
}

export async function POST(request: Request) {
  const user = await getServerSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const title = body?.title ?? "New Conversation";

  const conv = await prisma.conversation.create({
    data: { title, userId: user.id }
  });

  // Invalidate cache after creating new conversation
  try {
    const redis = await (await import("../../../lib/redis")).getRedisClient();
    await redis.del(`conversations:${user.id}`);
  } catch (error) {
    console.warn("Cache invalidation failed:", error);
  }

  return NextResponse.json(conv);
}
