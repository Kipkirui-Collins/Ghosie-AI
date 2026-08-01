import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getServerSessionUser } from "../../../lib/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");
  const user = await getServerSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!conversationId) return NextResponse.json({ error: "conversationId required" }, { status: 400 });

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" }
  });

  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const user = await getServerSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { conversationId, role, content, meta } = body;

  if (!conversationId || !role || typeof content !== "string") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const conv = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conv || conv.userId !== user.id) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const message = await prisma.message.create({
    data: { conversationId, role, content, meta }
  });

  return NextResponse.json(message);
}
