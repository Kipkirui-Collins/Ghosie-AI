import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";
import { getServerSessionUser } from "../../../lib/auth";
import { parseOpenAIStream } from "../../../lib/streamParser";
import { checkRateLimit, getRateLimitRemaining } from "../../../lib/rateLimiter";

export async function POST(request: Request) {
  const user = await getServerSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isAllowed = await checkRateLimit(`user:${user.id}`);
  if (!isAllowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  const body = await request.json();
  const { conversationId, prompt } = body;
  if (!conversationId || typeof prompt !== "string" || !prompt.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation || conversation.userId !== user.id) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  await prisma.message.create({
    data: { conversationId, role: "user", content: prompt.trim() }
  });

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" }
  });

  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return NextResponse.json({ error: "OpenAI API key not configured" }, { status: 500 });

  const res = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openaiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      input: messages.map((message) => ({ role: message.role, content: message.content })),
      stream: true
    })
  });

  if (!res.ok || !res.body) {
    const text = await res.text();
    return NextResponse.json({ error: "OpenAI error", detail: text }, { status: 500 });
  }

  const encoder = new TextEncoder();
  const remaining = await getRateLimitRemaining(`user:${user.id}`);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const reader = res.body!.getReader();
        let assistantContent = "";

        for await (const text of parseOpenAIStream(reader)) {
          assistantContent += text;
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
        }

        await prisma.message.create({
          data: { conversationId, role: "assistant", content: assistantContent }
        });

        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        console.error("Stream error:", error);
        controller.error(error);
      }
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
      "X-RateLimit-Remaining": remaining.toString()
    }
  });
}
