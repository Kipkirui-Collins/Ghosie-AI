import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const user = await prisma.user.upsert({
    where: { email: "demo@ghosieai.app" },
    update: {},
    create: {
      email: "demo@ghosieai.app",
      name: "Demo User"
    }
  });

  const conversation = await prisma.conversation.upsert({
    where: { id: "demo-conversation" },
    update: {},
    create: {
      id: "demo-conversation",
      title: "Getting started",
      userId: user.id
    }
  });

  await prisma.message.createMany({
    data: [
      { conversationId: conversation.id, role: "assistant", content: "Hello! I’m Ghosie AI. Ask me anything." },
      { conversationId: conversation.id, role: "user", content: "Show me the features." }
    ],
    skipDuplicates: true
  });

  console.log("✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
