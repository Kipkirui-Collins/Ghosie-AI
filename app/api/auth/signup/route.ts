import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { checkRateLimit } from "../../../../lib/rateLimiter";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ error: "Name, email, and password are required." }, { status: 400 });
  }

  // Rate limit by IP to prevent abuse
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const isAllowed = await checkRateLimit(`signup:${ip}`);
  if (!isAllowed) {
    return NextResponse.json(
      { error: "Too many signup attempts. Please try again later." },
      { status: 429 }
    );
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return NextResponse.json({ error: "A user with that email already exists." }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash
    }
  });

  return NextResponse.json({ success: true });
}
