import { getServerSession } from "next-auth/next";
import { authOptions } from "../server/authOptions";
import prisma from "./prisma";

export async function getServerSessionUser() {
  try {
    const session = (await getServerSession(authOptions as any)) as
      | { user?: { email?: string } }
      | null;

    if (!session?.user?.email) return null;

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    return user;
  } catch (e) {
    return null;
  }
}
