import { NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "../../../../lib/prisma";
import { checkRateLimit } from "../../../../lib/rateLimiter";

export async function POST(request: Request) {
  const body = await request.json();
  const { email } = body;

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  // Rate limit by IP to prevent abuse
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const isAllowed = await checkRateLimit(`forgot-password:${ip}`);
  if (!isAllowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  // Always return success to avoid user enumeration
  if (!user || !user.passwordHash) {
    return NextResponse.json({ success: true });
  }

  // Invalidate any existing unused tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true }
  });

  // Generate a secure random token
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      token,
      expires
    }
  });

  // In production, send an email with the reset link.
  // For now, log the token so it can be used in development.
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  console.log(`[Password Reset] Reset link for ${email}: ${resetUrl}`);

  return NextResponse.json({ success: true });
}